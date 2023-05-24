import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import express from 'express'
import midjourney from 'midjourney-client'
import xmlparser from 'express-xml-bodyparser'
import { v4 as uuidv4 } from 'uuid'
import moment from 'moment'
import type { RequestProps } from './types'
import type { ChatMessage } from './chatgpt'
import { chatConfig, chatReplyProcess, currentModel, initChatGPTApi } from './chatgpt'
import { auth, signUser, sqlAuth, userSqlAuth } from './middleware/auth'
import { limiter } from './middleware/limiter'
import { isNotEmptyString } from './utils/is'
import { addPasswordToFile, removePasswordFromFile } from './utils/store'
// import { compareTime } from './utils/dateAuth'
import {
  addOrUpdateUserInfo,
  changeAdminPassword,
  changeDatabaseApiKey,
  databaseApiKeys,
  deleteOpenApiKey,
  getUserInfo,
  getUserInfoPage,
  registerUser,
  removeUserInfo,
  userScanLoginWithOpenId,
  validateUser,
  verifyAdmin,
  verifyUser,
} from './utils/sql'
import * as SqlOperate from './utils/sql'
import type { UserInfo } from './utils/sql'
import { askToGenerateChart, clearUserFileCache, m_upload, queryFileQuestion } from './utils/fileqa'
import type { FileReadStatus } from './utils/fileqa'
import * as redisCache from './utils/redisCache'
import * as wechatApi from './utils/wechat'
import * as proxyMiddleware from './utils/proxy'

// queryFileQuestion('hbhpeng', '变量是什么').then((result) => {

// }).catch(() => {

// })
// console.log(await queryFileQuestion('hbhpeng', '变量是什么'))
let shouldProxyRequest = true
if (!process.env.YUAN_YUAN_IS_FENXIAO) {
  wechatApi.startQueryAccessToken()
  shouldProxyRequest = false
}
// process.env.wechatToken = '68_xF9DPvXJa0Oj6w1Nq4EWNdO6X4M8QfO0AEEoKvzs_nuCIuE7GtZXOHJO5pKk2m4xhdYY_Qn-iio8Cbg1ZUlI9URIjLMOVJhO5oS0s4EQHeana021WEGt1IST_wMTTXaAEAYYC'

const app = express()
export const router = express.Router()
const isExpire = false

app.use(express.static('public'))
app.use(express.json())
app.use(xmlparser())

app.all('*', (_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'authorization, Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})

function checkUserIsOutDate(endday: any) {
  if (!endday)
    return true
  return moment(endday).valueOf() <= Date.now()
}

async function chatCheck(req, res, prompt, extraPrice = 0) {
  if (isExpire)
    throw new Error('服务时间已过期，请续费')

  const username = userSqlAuth(req, res)
  if (!username || username.length < 5)
    throw new Error('您不能发送消息，请先登录，如果已经登录请重新登录')
  const userInfo = await getUserInfo(username)
  if (userInfo.isVip > 0 && checkUserIsOutDate(userInfo.vipendday))
    throw new Error('您还不是会员，请先开通会员吧')
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
    let chatString: ChatMessage
    await chatReplyProcess({
      message: prompt,
      lastContext: options,
      process: (chat: ChatMessage) => {
        chatString = chat
        const jsonString = JSON.stringify(chat)
        res.write(firstChunk ? jsonString : `\n${jsonString}`)
        firstChunk = false
      },
      systemMessage,
      temperature,
      top_p,
    })
    if (chatString && chatString.text)
      await chatCheck(req, res, chatString.text)
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
    // const EXPIRE_DATE_TIME = process.env.EXPIRE_DATE_TIME
    // isExpire = await compareTime(EXPIRE_DATE_TIME)
    SqlOperate.visitCache.visits++
    SqlOperate.visitCache.uniqueVisitors.add(req.ip)

    const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY
    const hasAuth = isNotEmptyString(AUTH_SECRET_KEY)
    let sessionid = req.headers.sessionid as string
    if (!(sessionid && redisCache.hasSessionId(sessionid)))
      sessionid = redisCache.createAndCacheSessionId()

    res.send({ status: 'Success', message: '', data: { auth: hasAuth, model: currentModel(), sessionid } })
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

// 产品相关
router.post('/product/add', async (req, res) => {
  try {
    if (shouldProxyRequest) {
      req.body.salerid = process.env.YUAN_YUAN_FENXIAO_ID
      await proxyMiddleware.proxyRequestMethod('post', '/product/add', req, res)
      return
    }

    if (!sqlAuth(req, res))
      return

    const { ...productInfo } = req.body as SqlOperate.OrderProductInfo
    if (!productInfo.name)
      throw new Error('产品名称不能为空')
    const pid = await SqlOperate.addAProductInfo(productInfo)
    res.send({ status: 'Success', message: pid, data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: '操作失败', data: null })
  }
})

router.post('/product/query', async (req, res) => {
  try {
    if (shouldProxyRequest) {
      req.body.salerid = process.env.YUAN_YUAN_FENXIAO_ID
      await proxyMiddleware.proxyRequestMethod('post', '/product/query', req, res)
      return
    }

    const salerid = req.body.salerid as string
    const productInfos: SqlOperate.OrderProductInfo[] = await SqlOperate.queryAllProductInfo(salerid)
    res.send({ status: 'Success', message: '查询成功', data: JSON.stringify(productInfos) })
  }
  catch (error) {
    res.send({ status: 'Fail', message: '操作失败', data: null })
  }
})

router.post('/product/delete', async (req, res) => {
  try {
    if (!sqlAuth(req, res))
      return

    const { ...productInfo } = req.body as SqlOperate.OrderProductInfo
    if (!productInfo.id)
      throw new Error('产品id不能为空')
    await SqlOperate.removeAProductInfo(productInfo.id)
    res.send({ status: 'Success', message: '删除成功', data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: '操作失败', data: null })
  }
})

// 管理账号
router.post('/admin/api/visits_statis', async (req, res) => {
  try {
    if (!sqlAuth(req, res))
      return

    const result = await SqlOperate.getTotalVisits()
    res.send({ status: 'Success', message: '操作成功', data: JSON.stringify(result) })
  }
  catch (error) {
    res.send({ status: 'Fail', message: '操作失败', data: null })
  }
})

router.post('/admin/api/order_statis', async (req, res) => {
  try {
    if (!sqlAuth(req, res))
      return

    const result = await SqlOperate.getAllOrderStatis()
    res.send({ status: 'Success', message: '操作成功', data: JSON.stringify(result) })
  }
  catch (error) {
    res.send({ status: 'Fail', message: '操作失败', data: null })
  }
})

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

router.post('/admin/api/changepassword', async (req, res) => {
  try {
    if (!sqlAuth(req, res))
      return

    const { username, oldpw, newpw } = req.body as { username: string; oldpw: string; newpw: string }
    const success = await changeAdminPassword(username, oldpw, newpw)
    if (success)
      res.send({ status: 'Success', message: '密码修改成功', data: '' })
    else
      res.send({ status: 'Fail', message: '密码错误', data: '' })
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

    // 尝试同步主厂商的用户权益
    if (shouldProxyRequest) {
      const userInfo = await proxyMiddleware.requestTopLevelUserToSync(req.headers.usertoken) as UserInfo
      const endday = redisCache.turnDayTimeToNoraml(userInfo.vipendday)
      await SqlOperate.updateUserBenefit(userInfo.username, userInfo.usagecount, endday, userInfo.isVip)
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
    if (shouldProxyRequest)
      return

    const signature = req.query.signature
    const timestamp = req.query.timestamp
    const nonce = req.query.nonce
    const echostr = req.query.echostr
    const token = wechatApi.APPTOKEN // 请按照公众平台官网\基本配置中信息填写
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

router.post('/wx', async (req, res) => {
  try {
    const xmlData = req.body.xml
    // console.log(xmlData)
    res.header('Content-Type', 'application/xml; charset=utf-8')
    if (xmlData.msgtype.includes('event')) {
      switch (xmlData.event[0]) {
        case 'subscribe': {
          const scence_str = xmlData.eventkey[0]
          // console.log(scence_str)
          if (scence_str && scence_str.startsWith('qrscene_')) {
            const result = scence_str.replace(/^qrscene_/i, '')
            const cacheInfo = redisCache.getValueWithSessionId(result) as any
            let existUsername = ''
            if (cacheInfo && cacheInfo.username)
              existUsername = cacheInfo.username

            // 尝试拿分销信息
            let fenxiao = ''
            if (!shouldProxyRequest) {
              // 主系统才拿分销信息
              fenxiao = redisCache.getFenXiaoWithSessionId(result)
            }

            const { username } = await userScanLoginWithOpenId(xmlData.fromusername[0], existUsername, fenxiao)
            redisCache.loginedWithSessionId(result, username)

            if (fenxiao) {
              // 拿到了分销信息 看看合法吗
              const salerInfo = await SqlOperate.getSalerInfoByNameId(fenxiao)
              if (salerInfo && salerInfo.baseurl) {
                // 分销信息 给分销系统发送信息
                await proxyMiddleware.forwardRequestMethod(`${salerInfo.baseurl}/wx`, 'post', req, res)
              }
            }
          }
          // 发送欢迎消息
          const welcome = wechatApi.replySubscribeData(xmlData.tousername[0], xmlData.fromusername[0])
          res.write(welcome)
          break
        }
        case 'SCAN': {
          const result = xmlData.eventkey[0]
          // console.log(result)
          const cacheInfo = redisCache.getValueWithSessionId(result) as any
          let existUsername = ''
          if (cacheInfo && cacheInfo.username)
            existUsername = cacheInfo.username

          // 尝试拿分销信息
          let fenxiao = ''
          if (!shouldProxyRequest) {
            // 主系统才拿分销信息
            fenxiao = redisCache.getFenXiaoWithSessionId(result)
          }

          const { username } = await userScanLoginWithOpenId(xmlData.fromusername[0], existUsername, fenxiao)
          redisCache.loginedWithSessionId(result, username)

          if (fenxiao) {
            // 拿到了分销信息 看看合法吗
            const salerInfo = await SqlOperate.getSalerInfoByNameId(fenxiao)
            if (salerInfo && salerInfo.baseurl) {
              // 分销信息 转发请求
              await proxyMiddleware.forwardRequestMethod(`${salerInfo.baseurl}/wx`, 'post', req, res)
            }
          }
          break
        }
      }
    }
    else if (xmlData.msgtype.includes('text')) {
      const reply = wechatApi.replyUserSendMessageData(xmlData)
      res.write(reply)
    }
  }
  catch (error) {
    // console.log(error)
    res.write('')
  }
  finally {
    res.end()
  }
})

router.get('/user/loginwximage', async (req, res) => {
  const sessionid = req.headers.sessionid as string
  try {
    const username = userSqlAuth(req, res)
    if (sessionid && redisCache.loginCheckSessionId(sessionid, username)) {
      // 要先设置sessionid 分销系统再转发请求
      if (shouldProxyRequest) {
        await proxyMiddleware.proxyRequestMethod('get', '/user/loginwximage', req, res)
        return
      }

      const url = await wechatApi.getWechatOfficialQrcode(sessionid)
      if (url)
        res.send({ status: 'Success', message: url, data: JSON.stringify({ url }) })

      else
        throw new Error('请重新刷新页面')
    }
    else {
      throw new Error('请重新刷新页面')
    }
  }
  catch (error) {
    // console.log(error)
    res.write(JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
  }
  finally {
    res.end()
  }
})

router.get('/user/islogin', async (req, res) => {
  const sessionid = req.headers.sessionid as string
  // res.send({ status: 'Success', message: '登录成功', data: JSON.stringify({ token: signUser(username) }) })
  try {
    const username = userSqlAuth(req, res)
    if (username) {
      // 用户已经登录 说明是想看看openid有没有
      const userInfo = await SqlOperate.getUserInfo(username)
      if (userInfo && userInfo.openid)
        res.send({ status: 'Success', message: '绑定成功', data: JSON.stringify({ tokeno: signUser(userInfo.openid) }) })

      else
        throw new Error('请扫描二维码关注公众号')
    }
    else if (sessionid) {
      const userInfo = redisCache.getValueWithSessionId(sessionid) as any
      // console.log('userInfo' + userInfo)
      if (userInfo.islogin === 2 && userInfo.username)
        res.send({ status: 'Success', message: '登录成功', data: JSON.stringify({ token: signUser(userInfo.username) }) })

      else
        throw new Error('请重新刷新页面')
    }
    else {
      throw new Error('请重新刷新页面')
    }
  }
  catch (error) {
    res.end()
  }
})

router.post('/wxpay/notify', async (req, res) => {
  // let info = req.weixin
  try {
    res.header('Content-Type', 'application/xml; charset=utf-8')
    const xmldata = req.body.xml
    // 业务逻辑...
    if (xmldata.return_code[0] === 'SUCCESS') {
      if (xmldata.appid[0] !== wechatApi.APPID || xmldata.mch_id[0] !== wechatApi.MCHID)
        throw new Error('商户信息错误')

      // trade_state
      // SUCCESS：支付成功
      // REFUND：转入退款
      // NOTPAY：未支付
      // CLOSED：已关闭
      // REVOKED：已撤销（付款码支付）
      // USERPAYING：用户支付中（付款码支付）
      // PAYERROR：支付失败(其他原因，如银行返回失败)
      // 回复消息(参数为空回复成功, 传值则为错误消息)
      // 查openid out_trade_no 把对应的订单信息改为成功，开通相应产品
      const openid = xmldata.openid[0]
      const out_trade_no = xmldata.out_trade_no[0]
      await SqlOperate.updateUserOrderInfoByOrderId('', openid, out_trade_no, SqlOperate.OrderStatus.Paid)
      const fenxiao = SqlOperate.getFenXiaoWithSessionId(out_trade_no)
      if (fenxiao) {
        // 把字数 vip状态 时间都跟分销商同步一下
        const userInfo = await SqlOperate.getUserInfoWithOpenid(openid, fenxiao)
        const salerInfo = await SqlOperate.getSalerInfoByNameId(fenxiao)
        if (userInfo && salerInfo)
          proxyMiddleware.syncSalerUserInfo(userInfo, salerInfo)
      }
    }
    else {
      // 删除订单? 支付中？支付失败？
    }
    res.send(wechatApi.replyPayData())
  }
  catch (error) {
    res.send(wechatApi.replyPayData(error.message))
  }
})
// 支付的两种方法
router.post('/user/payurl', async (req, res) => {
  // const { question } = req.body as { question: string }
  try {
    const username = userSqlAuth(req, res)
    if (!username) {
      res.send({ status: 'Fail', message: '请重新登录', data: JSON.stringify({ status: '3' }) })
      return
    }

    if (shouldProxyRequest) {
      // 分销转发
      req.body.salerid = process.env.YUAN_YUAN_FENXIAO_ID
      await proxyMiddleware.proxyRequestMethod('post', '/user/payurl', req, res)
      return
    }

    const { productid } = req.body as { productid: string }
    const productInfo = await SqlOperate.getProductInfoByProductId(parseInt(productid))
    const user: UserInfo = await getUserInfo(username)
    if (!user || !user.openid)
      throw new Error('请先关注或者扫描公众号绑定账号')
    if (productInfo.needvip > 0) {
      if (checkUserIsOutDate(user.vipendday))
        throw new Error('您现在还不是会员哦')
    }
    let orderId = ''
    if (req.body.salerid)
      orderId = `${req.body.salerid}_`

    orderId += uuidv4().slice(0, 8) + uuidv4().slice(-8)
    const openid = redisCache.turnOpenidToNormal(user.openid)
    await SqlOperate.deleteAllUserOrderUncomplete(openid, username, req.body.salerid)
    await SqlOperate.createAnOrderInfo(username, openid, productid, orderId, productInfo.nowprice, req.body.salerid)
    const orderPrice = Math.floor(productInfo.nowprice * 100)
    const { prepay_id, code_url } = await wechatApi.payApi.unifiedOrder({
      out_trade_no: orderId,
      body: productInfo.name,
      total_fee: orderPrice.toString(),
      openid,
      trade_type: 'NATIVE',
      product_id: productid,
    })

    if (code_url)
      res.send({ status: 'Success', message: code_url, data: JSON.stringify({ orderId }) })
    else
      throw new Error('请重新刷新页面')
  }
  catch (error) {
    res.write(JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
  }
  finally {
    res.end()
  }
})

router.post('/user/get_pay_params', async (req, res) => {
  try {
    if (shouldProxyRequest) {
      // 分销转发
      req.body.salerid = process.env.YUAN_YUAN_FENXIAO_ID
      await proxyMiddleware.proxyRequestMethod('post', '/user/get_pay_params', req, res)
      return
    }

    const username = userSqlAuth(req, res)
    if (!username) {
      res.send({ status: 'Fail', message: '请重新登录', data: JSON.stringify({ status: '3' }) })
      return
    }

    const { productid } = req.body as { productid: string }
    const productInfo = await SqlOperate.getProductInfoByProductId(parseInt(productid))
    const user: UserInfo = await getUserInfo(username)
    if (!user || !user.openid)
      throw new Error('请先关注或者扫描公众号绑定账号')
    if (productInfo.needvip > 0) {
      if (checkUserIsOutDate(user.vipendday))
        throw new Error('您现在还不是会员哦')
    }
    let orderId = ''
    if (req.body.salerid)
      orderId = `${req.body.salerid}_`

    orderId += uuidv4().slice(0, 8) + uuidv4().slice(-8)
    const openid = redisCache.turnOpenidToNormal(user.openid)
    const orderPrice = Math.floor(productInfo.nowprice * 100)
    const result = await wechatApi.payApi.unifiedOrder({
      out_trade_no: orderId,
      body: productInfo.name,
      total_fee: orderPrice.toString(),
      openid,
    })

    if (result.result_code !== 'SUCCESS')
      throw new Error('预支付交易错误')

    await SqlOperate.deleteAllUserOrderUncomplete(openid, username, req.body.salerid)
    await SqlOperate.createAnOrderInfo(username, openid, productid, orderId, productInfo.nowprice, req.body.salerid)

    const prepay_id = result.prepay_id
    const paramData = wechatApi.getWechatPayParam(prepay_id)
    res.send({ status: 'Success', message: '查询成功', data: JSON.stringify(paramData) })
  }
  catch (error) {
    res.write(JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
  }
  finally {
    res.end()
  }
})

router.post('/user/checkpay', async (req, res) => {
  try {
    if (shouldProxyRequest) {
      // 分销转发
      await proxyMiddleware.proxyRequestMethod('post', '/user/checkpay', req, res)
      return
    }
    const username = userSqlAuth(req, res)
    if (!username) {
      res.send({ status: 'Fail', message: '请重新登录', data: JSON.stringify({ status: '3' }) })
      return
    }
    const { orderid } = req.body as { orderid: string }
    const orderInfo = await SqlOperate.getUserOrderInfoByOrderid(orderid, '', username)
    if (orderInfo.orderstate === SqlOperate.OrderStatus.Paid) {
      res.send({ status: 'Success', message: '成功', data: '' })
    }
    else {
      const result = await wechatApi.payApi.orderQuery({ out_trade_no: orderid })
      if (result.return_code === 'SUCCESS') {
        if (result.trade_state === 'SUCCESS') {
          await SqlOperate.updateUserOrderInfoByOrderId(username, '', orderid, SqlOperate.OrderStatus.Paid)
          // 尝试把字数 vip状态跟分销商同步
          const fenxiao = SqlOperate.getFenXiaoWithSessionId(orderid)
          if (fenxiao) {
            const userInfo = await SqlOperate.getUserInfo(username)
            const salerInfo = await SqlOperate.getSalerInfoByNameId(fenxiao)
            if (userInfo && salerInfo)
              proxyMiddleware.syncSalerUserInfo(userInfo, salerInfo)
          }
          res.send({ status: 'Success', message: '成功', data: '' })
        }
        else {
          res.send({ status: 'Fail', message: '支付未完成', data: '' })
        }
      }
      else {
        throw new Error('查询订单失败，请稍后重试')
      }
    }
  }
  catch (error) {
    res.write(JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
  }
  finally {
    res.end()
  }
})

// 分销商同步接口
router.post('/saler/syncuser', async (req, res) => {
  try {
    const { ...userInfo } = req.body as UserInfo
    const endday = redisCache.turnDayTimeToNoraml(userInfo.vipendday)
    await SqlOperate.updateUserBenefit(userInfo.username, userInfo.usagecount, endday, userInfo.isVip)
    res.send({ status: 'Success', message: '同步成功', data: '' })
  }
  catch (error) {
    res.write(JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
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
