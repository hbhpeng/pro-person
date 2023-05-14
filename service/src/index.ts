import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import express from 'express'
import midjourney from 'midjourney-client'
import xmlparser from 'express-xml-bodyparser'
import type { RequestProps } from './types'
import type { ChatMessage } from './chatgpt'
import { chatConfig, chatReplyProcess, currentModel, initChatGPTApi } from './chatgpt'
import { auth, signUser, sqlAuth, userSqlAuth } from './middleware/auth'
import { limiter } from './middleware/limiter'
import { isNotEmptyString } from './utils/is'
import { addPasswordToFile, removePasswordFromFile } from './utils/store'
import { compareTime } from './utils/dateAuth'
import { addOrUpdateUserInfo, changeDatabaseApiKey, databaseApiKeys, deleteOpenApiKey, getUserInfo, getUserInfoPage, registerUser, removeUserInfo, validateUser, verifyAdmin, verifyUser } from './utils/sql'
import type { UserInfo } from './utils/sql'
import { askToGenerateChart, clearUserFileCache, m_upload, queryFileQuestion } from './utils/fileqa'
import type { FileReadStatus } from './utils/fileqa'

// queryFileQuestion('hbhpeng', '变量是什么').then((result) => {

// }).catch(() => {

// })
// console.log(await queryFileQuestion('hbhpeng', '变量是什么'))

const app = express()
const router = express.Router()
let isExpire = false

app.use(express.static('public'))
app.use(express.json())
app.use(xmlparser())

app.all('*', (_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'authorization, Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})

async function chatCheck(req, res, prompt, extraPrice = 0) {
  if (isExpire)
    throw new Error('服务时间已过期，请续费')

  const username = userSqlAuth(req, res)
  if (!username || username.length < 5)
    throw new Error('您不能发送消息，请先登录，如果已经登录请重新登录')
  const userInfo = await getUserInfo(username)
  if (userInfo.usecount + extraPrice - userInfo.usagecount >= 0.0)
    throw new Error('您的字数不足，请购买字数包')

  userInfo.usecount = userInfo.usecount + prompt.length / 10000.0 + extraPrice
  addOrUpdateUserInfo(userInfo)
}

router.post('/chat-process', [auth, limiter], async (req, res) => {
  res.setHeader('Content-type', 'application/octet-stream')

  try {
    const { prompt, options = {}, systemMessage, temperature, top_p } = req.body as RequestProps
    await chatCheck(req, res, prompt)

    let firstChunk = true
    let chatString: string
    await chatReplyProcess({
      message: prompt,
      lastContext: options,
      process: (chat: ChatMessage) => {
        chatString = JSON.stringify(chat)
        res.write(firstChunk ? chatString : `\n${chatString}`)
        firstChunk = false
      },
      systemMessage,
      temperature,
      top_p,
    })
    if (chatString)
      await chatCheck(req, res, chatString)
  }
  catch (error) {
    res.write(JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
  }
  finally {
    res.end()
  }
})

router.post('/config', auth, async (req, res) => {
  try {
    const response = await chatConfig()
    res.send(response)
  }
  catch (error) {
    res.send(error)
  }
})

router.post('/addPasswd', auth, async (req, res) => {
  try {
    const { token, admin } = req.body as { token: string; admin: string }
    if (!admin || admin !== process.env.OPENAI_ADMAIN_TOKEN) {
      res.send({ status: 'Fail', message: '您没有权限', data: null })
      return
    }
    addPasswordToFile(token)
    res.send({ status: 'Success', message: '添加成功', data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/removePasswd', auth, async (req, res) => {
  try {
    const { token, admin } = req.body as { token: string; admin: string }
    if (!admin || admin !== process.env.OPENAI_ADMAIN_TOKEN) {
      res.send({ status: 'Fail', message: '您没有权限', data: null })
      return
    }
    removePasswordFromFile(token)
    res.send({ status: 'Success', message: '删除成功', data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/session', async (req, res) => {
  try {
    const EXPIRE_DATE_TIME = process.env.EXPIRE_DATE_TIME
    isExpire = await compareTime(EXPIRE_DATE_TIME)
    const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY
    const hasAuth = isNotEmptyString(AUTH_SECRET_KEY)
    res.send({ status: 'Success', message: '', data: { auth: hasAuth, model: currentModel() } })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body as { token: string }
    if (!token)
      throw new Error('Secret key is empty')

    if (process.env.AUTH_SECRET_KEY !== token)
      throw new Error('密钥无效 | Secret key is invalid')

    res.send({ status: 'Success', message: 'Verify successfully', data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

// 管理账号
router.post('/admin/user/adduser', async (req, res) => {
  try {
    if (!sqlAuth(req, res))
      return

    const { ...userinfo } = req.body as UserInfo
    if (!userinfo.username || !userinfo.password)
      throw new Error('用户名密码不能为空')

    const { status, error } = await addOrUpdateUserInfo(userinfo)
    if (error)
      throw error

    res.send({ status: 'Success', message: '操作成功', data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: '操作失败', data: null })
  }
})

router.post('/admin/user/deleteuser', async (req, res) => {
  try {
    if (!sqlAuth(req, res))
      return

    const { ...userinfo } = req.body as UserInfo
    const { status, error } = await removeUserInfo(userinfo)
    if (error)
      throw error
    res.send({ status: 'Success', message: '删除成功', data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: '操作失败', data: null })
  }
})

router.post('/admin/user/getuser', async (req, res) => {
  try {
    if (!sqlAuth(req, res))
      return

    const { page, pageSize } = req.body as { page: number; pageSize: number }
    const userInfos: UserInfo[] = await getUserInfoPage(page, pageSize)
    res.send({ status: 'Success', message: '查询成功', data: JSON.stringify(userInfos) })
  }
  catch (error) {
    res.send({ status: 'Fail', message: '操作失败', data: null })
  }
})

router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body as { username: string; password: string }
    const isLogin = await verifyAdmin(username, password)
    if (isLogin)
      res.send({ status: 'Success', message: '登录成功', data: JSON.stringify({ token: signUser(username) }) })
    else
      res.send({ status: 'Fail', message: '用户名或者密码错误', data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: '操作失败', data: null })
  }
})

// about apikey
router.post('/admin/api/changeapikeys', async (req, res) => {
  try {
    if (!sqlAuth(req, res))
      return

    const { apikey } = req.body as { apikey: string }
    await changeDatabaseApiKey(apikey)
    process.env.OPENAI_API_KEY = apikey
    initChatGPTApi()
    res.send({ status: 'Success', message: '操作成功', data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: '操作失败', data: null })
  }
})

router.post('/admin/api/deleteapikeys', async (req, res) => {
  try {
    if (!sqlAuth(req, res))
      return

    const { apikey } = req.body as { apikey: string }
    await deleteOpenApiKey(apikey)
    if (apikey === process.env.OPENAI_API_KEY)
      process.env.OPENAI_API_KEY = ''

    res.send({ status: 'Success', message: '操作成功', data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: '操作失败', data: null })
  }
})

router.post('/admin/api/getapikeys', async (req, res) => {
  try {
    if (!sqlAuth(req, res))
      return

    const data = await databaseApiKeys()
    const result = { usekey: process.env.OPENAI_API_KEY, allkey: data }
    res.send({ status: 'Success', message: '操作成功', data: JSON.stringify(result) })
  }
  catch (error) {
    res.send({ status: 'Fail', message: '操作失败', data: null })
  }
})

// 用户管理
router.post('/user/login', async (req, res) => {
  try {
    const { username, password } = req.body as { username: string; password: string }
    const isLogin = await verifyUser(username, password)
    if (isLogin)
      res.send({ status: 'Success', message: '登录成功', data: JSON.stringify({ token: signUser(username) }) })
    else
      res.send({ status: 'Fail', message: '用户名或者密码错误', data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: '操作失败', data: null })
  }
})

router.post('/user/register', async (req, res) => {
  try {
    const { username, password } = req.body as { username: string; password: string }
    if (!validateUser(username, password)) {
      res.send({ status: 'Fail', message: '用户名或者密码不合法', data: null })
      return
    }
    const isLogin = await registerUser(username, password)
    if (isLogin)
      res.send({ status: 'Success', message: '注册成功', data: JSON.stringify({ token: signUser(username) }) })
    else
      res.send({ status: 'Fail', message: '操作失败', data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: '操作失败，请更换用户名', data: null })
  }
})

router.post('/user/getuserinfo', async (req, res) => {
  try {
    const username = userSqlAuth(req, res)
    if (!username) {
      res.send({ status: 'Fail', message: '请重新登录', data: JSON.stringify({ status: '3' }) })
      return
    }
    const userinfo = await getUserInfo(username)
    if (userinfo)
      res.send({ status: 'Success', message: '查询成功', data: JSON.stringify(userinfo) })
    else
      res.send({ status: 'Fail', message: '操作失败', data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: '操作失败', data: null })
  }
})

router.post('/chat/image', async (req, res) => {
  try {
    const username = userSqlAuth(req, res)
    if (!username) {
      res.send({ status: 'Fail', message: '请重新登录', data: JSON.stringify({ status: '3' }) })
      return
    }
    const { prompot } = req.body as { prompot: string }
    await chatCheck(req, res, prompot)
    const url = await midjourney(`mdjrny-v4 style${prompot}`)
    res.send({ status: 'Success', message: '', data: JSON.stringify({ content: `![image 图片](${url})` }) })
  }
  catch (error) {
    res.write(JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    res.end()
  }
})

router.post('/chat/makeppt', async (req, res) => {
  try {
    const username = userSqlAuth(req, res)
    if (!username) {
      res.send({ status: 'Fail', message: '请重新登录', data: JSON.stringify({ status: '3' }) })
      return
    }

    const { topic, length } = req.body as { topic: string; length: string }
    await chatCheck(req, res, topic, 1)
    // 调用python脚本
    const pythonProcess = spawn('python3', ['./main.py', topic, length, process.env.OPENAI_API_KEY, username])

    // 监听python脚本的输出
    pythonProcess.stdout.on('data', () => {
      // console.log(`输出：${data}`);
    })

    // 监听python脚本的错误
    pythonProcess.stderr.on('data', () => {
      // console.error(`错误：${data}`);
    })

    // 监听python脚本的退出事件
    pythonProcess.on('close', (code) => {
      if (code === 0)
        res.send({ status: 'Success', message: '操作成功', data: '' })
      else
        res.send({ status: 'Fail', message: '操作失败', data: '' })
    })
  }
  catch (error) {
    // console.log(error)
    res.write(JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    res.end()
  }
})

router.post('/file/downloadppt', (req, res) => {
  const username = userSqlAuth(req, res)
  if (!username) {
    res.send({ status: 'Fail', message: '请重新登录', data: JSON.stringify({ status: '3' }) })
    return
  }
  try {
    const dirPath = `${path.dirname(path.dirname(__filename))}/data/caches/${username}`
    const files = fs.readdirSync(dirPath)
    const firstFile = files[0]
    const fullPath = `${dirPath}/${firstFile}`
    const readStream = fs.createReadStream(fullPath)
    res.writeHead(200, {
      'Content-Type': 'application/force-download',
      'Content-Disposition': `attachment; filename=${encodeURIComponent(firstFile)}`,
    })
    readStream.pipe(res)
  }
  catch (error) {
    res.send({ status: 'Fail', message: '操作失败', data: '' })
  }
})

router.post('/file/uploadqafile', m_upload.single('file'), async (req, res) => {
  const username = userSqlAuth(req, res)
  if (!username) {
    res.send({ status: 'Fail', message: '请重新登录', data: JSON.stringify({ status: '3' }) })
    return
  }
  try {
    const file = req.file
    if (file) {
      clearUserFileCache(username)
      await chatCheck(req, res, '', 1)

      const { status, message } = await queryFileQuestion(username, '') as FileReadStatus
      if (status)
        res.send({ status: 'Success', message: '上传成功', data: message })
      else
        res.send({ status: 'Fail', message, data: '' })
    }
    else { res.send({ status: 'Fail', message: '上传失败', data: '' }) }
  }
  catch (error) {
    // res.send({ status: 'Fail', message: '操作失败', data: '' })
    res.write(JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    res.end()
  }
})

router.post('/file/askquestion', async (req, res) => {
  const username = userSqlAuth(req, res)
  if (!username) {
    res.send({ status: 'Fail', message: '请重新登录', data: JSON.stringify({ status: '3' }) })
    return
  }
  try {
    const { question } = req.body as { question: string }
    const answer = await queryFileQuestion(username, question) as FileReadStatus
    if (answer.status) {
      await chatCheck(req, res, question + answer)

      res.send({ status: 'Success', message: '成功', data: JSON.stringify(answer) })
    }
    else { throw new Error(answer.message) }
  }
  catch (error) {
    // res.send({ status: 'Fail', message: '操作失败', data: '' })
    res.write(JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
  }
  finally {
    res.end()
  }
})

router.post('/generate-chart', async (req, res) => {
  try {
    const username = userSqlAuth(req, res)
    if (!username) {
      res.send({ status: 'Fail', message: '请重新登录', data: JSON.stringify({ status: '3' }) })
      return
    }
    const { prompt } = req.body as { prompt: string }
    await chatCheck(req, res, prompt, 0.5)
    const chartConfig = await askToGenerateChart(prompt)
    res.write(JSON.stringify({ success: true, chartConfig }))
  }
  catch (error) {
    res.write(JSON.stringify({ success: false, message: '出了点小错误，请稍后再试吧' }))
  }
  finally {
    res.end()
  }
})

// 微信模块
router.get('/wx', (req, res) => {
  try {
    const signature = req.query.signature
    const timestamp = req.query.timestamp
    const nonce = req.query.nonce
    const echostr = req.query.echostr
    const token = 'jhyuanyouyuankeji' // 请按照公众平台官网\基本配置中信息填写
    const arr = [token, timestamp, nonce]
    arr.sort()

    const sha1 = crypto.createHash('sha1')
    sha1.update(arr.join(''))

    const hashcode = sha1.digest('hex')

    // console.log(`handle/GET func: hashcode, signature: ${hashcode}, ${signature}`);

    if (hashcode === signature)
      res.write(echostr)

    else
      res.write('')
  }
  catch (error) {
    res.write('')
  }
  finally {
    res.end()
  }
})

router.post('/wx', (req, res) => {
  try {
    const xmlData = req.body.xml
    // console.log(xmlData)
  }
  catch (error) {
    res.write('')
  }
  finally {
    res.end()
  }
})

app.use('', router)
app.use('/api', router)
app.set('trust proxy', 1)

app.listen(3002, () => globalThis.console.log('Server is running on port 3002'))

// const options = {
//   cert: fs.readFileSync('/path/to/cert.pem'),
//   key: fs.readFileSync('/path/to/key.pem')
// };
// https.createServer(options, app).listen(443, () => {
//   console.log('Server started on port 443');
// });
