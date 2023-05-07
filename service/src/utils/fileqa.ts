import fs from 'fs'
import path from 'path'
import { Configuration, OpenAIApi } from 'openai'
// import { promisify } from 'util'
import KDTree from 'kd-tree-javascript'
import QuickLRU from 'quick-lru'
import * as multer from 'multer'
import { userSqlAuth } from '../middleware/auth'

export interface FileReadStatus {
  status: boolean
  message: any
}

const limit = 10
const qaCache = new QuickLRU({ maxSize: 10 })

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

export const createEmbeddings = async (input: any) => {
  const result = []
  // limit about 1000 tokens per request
  const lens = input.map((text: string) => text.length)
  let queryLen = 0
  let startIndex = 0
  let tokens = 0

  const getEmbedding = async (inputSlice: any[]) => {
    const embedding = await openai.createEmbedding({ input: inputSlice, model: 'text-embedding-ada-002' }).then((res) => {
      return res.data.data
    })
    return [inputSlice.map((text, index) => [text, embedding[index].embedding]), embedding.length]
  }

  for (let index = 0; index < lens.length; index++) {
    const l = lens[index]
    queryLen += l
    if (queryLen > 4096) {
      const [ebd, tk] = await getEmbedding(input.slice(startIndex, index + 1))
      queryLen = 0
      startIndex = index + 1
      tokens += tk as number
      result.push(...(ebd as any[]))
    }
  }

  if (queryLen > 0) {
    const [ebd, tk] = await getEmbedding(input.slice(startIndex))
    tokens += tk as number
    result.push(...(ebd as any[]))
  }
  return [result, tokens]
}

const createEmbedding = async (text) => {
  const embedding = await openai.createEmbedding({ input: [text], model: 'text-embedding-ada-002' }).then((res) => {
    return res.data.data
  })
  return [text, embedding[0].embedding]
}

class HPFileQA {
  private index: KDTree.kdTree<any>
  private data: any[]
  constructor(dataEmbe) {
    const embeddings = dataEmbe.map(item => item[1])
    const data = dataEmbe.map(item => item[0])

    // 将数据转换为K-d Tree所需的格式（每个元素都是{x,y}对象）
    const treeData = embeddings.map((embedding, i) => {
      return { i, x: embedding }
    })

    // 创建K-d Tree
    const CreateKDTree = KDTree.kdTree
    const kdTree = new CreateKDTree(treeData, euclideanDist, ['x'])

    this.index = kdTree
    this.data = data
  }

  async callQuery(query) {
    const embedding = await createEmbedding(query) // assume createEmbedding is already defined
    const context = this.getTexts(embedding[1], limit) // assume limit is already defined
    const answer = await this.completion(query, context) // assume completion is already defined
    return [answer, context]
  }

  getTexts(embeding, limit) {
    const k = Math.min(this.data.length, limit)
    const result = this.index.nearest({ x: embeding }, k)

    const context = []
    for (const item of result) {
      const index = item[0].i
      context.push(...this.data.slice(index, index + 5))
    }
    return context
  }

  async completion(query: string, context: any) {
    // Create a completion.
    const text = context.join('\n')

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'system', content: `你是一个有帮助的AI文章助手，从下文中提取有用的内容进行回答，不能回答不在下文提到的内容，相关性从高到底排序：\n\n${text}` },
        { role: 'user', content: query },
      ],
      max_tokens: 3000,
    }).then((res) => {
      return res.data
    })
    // console.log('使用的tokens：', response.choices[0].logprobs.token_logprobs.length);

    return response.choices[0].message.content
  }
}

/**
 * 计算两个向量之间的欧几里得距离
 * @param {Object} p1 第一个向量（格式必须是{x,y}对象）
 * @param {Object} p2 第二个向量（格式必须是{x,y}对象）
 */
function euclideanDist(p1: any, p2: any) {
  const s = Object.keys(p1).reduce((sum, key) => sum + (p1[key] - p2[key]) ** 2, 0)
  return Math.sqrt(s)
}

export async function queryFileQuestion(username: string, question: string) {
  if (qaCache.has(username)) {
    const qa = qaCache.get(username) as HPFileQA
    const [answer, context] = await qa.callQuery(question)
    return { status: true, messsage: `相关片段：\n${context} \n\n 回答如下：\n${answer}` }
  }
  // 获取当前模块所在目录的上上一级目录
  const parentDir = path.join(__dirname, '../../')

  // 拼接出cache目录的路径
  const cacheDir = path.join(parentDir, 'data', 'fileread', username)

  let dataEmbe, tokens
  // 如果cache目录不存在，则创建它
  if (!fs.existsSync(cacheDir))
    fs.mkdirSync(cacheDir, { recursive: true })

  const fileEmbeddingPath = path.join(cacheDir, 'embed')
  const inputFilePath = path.join(cacheDir, 'file')
  if (!fs.existsSync(inputFilePath))
    return { status: false, message: '文件不存在' }

  if (fs.existsSync(fileEmbeddingPath)) {
    dataEmbe = fs.readFileSync(fileEmbeddingPath, 'utf8')
    dataEmbe = JSON.parse(dataEmbe)
  }
  else {
    const texts = fs.readFileSync(inputFilePath, 'utf8').split('\n').map(text => text.trim()).filter(Boolean);
    [dataEmbe, tokens] = await createEmbeddings(texts)
    fs.writeFileSync(fileEmbeddingPath, JSON.stringify(dataEmbe))
  }

  const qa = new HPFileQA(dataEmbe)
  qaCache.set(username, qa)
  if (!question) {
    const [answer] = await qa.callQuery('所有的内容做个总结')
    return { status: true, messsage: `总结如下：\n${answer}` }
  }
  const [answer, context] = await qa.callQuery(question)
  return { status: true, messsage: `相关片段：\n${context} \n\n 回答如下：\n${answer}` }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 获取当前模块所在目录的上上一级目录
    const username = userSqlAuth(req, null)

    const parentDir = path.join(__dirname, '../../')
    // 拼接出cache目录的路径
    const cacheDir = path.join(parentDir, 'data', 'fileread', username)

    // 如果cache目录不存在，则创建它
    if (!fs.existsSync(cacheDir))
      fs.mkdirSync(cacheDir, { recursive: true })

    cb(null, cacheDir)
  },
  filename: (req, file, cb) => {
    cb(null, 'file')
  },
})

export const m_upload = multer.default({
  storage,
  limits: {
    fileSize: 100 * 1024,
  },
}).single('file')