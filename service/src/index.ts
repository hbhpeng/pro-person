import express from 'express'
import type { RequestProps } from './types'
import type { ChatMessage } from './chatgpt'
import { chatConfig, chatReplyProcess, currentModel } from './chatgpt'
import { auth, signUser, sqlAuth, userSqlAuth } from './middleware/auth'
import { limiter } from './middleware/limiter'
import { isNotEmptyString } from './utils/is'
import { addPasswordToFile, removePasswordFromFile } from './utils/store'
import { compareTime } from './utils/dateAuth'
import { addOrUpdateUserInfo, getUserInfo, getUserInfoPage, registerUser, removeUserInfo, validateUser, verifyAdmin, verifyUser } from './utils/sql'
import type { UserInfo } from './utils/sql'

const app = express()
const router = express.Router()
let isExpire = false

app.use(express.static('public'))
app.use(express.json())

app.all('*', (_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'authorization, Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})

router.post('/chat-process', [auth, limiter], async (req, res) => {
  res.setHeader('Content-type', 'application/octet-stream')

  try {
    const { prompt, options = {}, systemMessage, temperature, top_p } = req.body as RequestProps
    if (isExpire)
      throw new Error('服务时间已过期，请续费')

    const username = userSqlAuth(req, res)
    if (!username || username.length < 5)
      throw new Error('您不能发送消息，请先登录，如果已经登录请重新登录')
    const userInfo = await getUserInfo(username)
    if (userInfo.usecount - userInfo.usagecount >= 0.0)
      throw new Error('您的字数已经超了，请购买字数包')

    userInfo.usecount = userInfo.usecount + prompt.length / 10000.0
    addOrUpdateUserInfo(userInfo)

    let firstChunk = true
    await chatReplyProcess({
      message: prompt,
      lastContext: options,
      process: (chat: ChatMessage) => {
        res.write(firstChunk ? JSON.stringify(chat) : `\n${JSON.stringify(chat)}`)
        firstChunk = false
      },
      systemMessage,
      temperature,
      top_p,
    })
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

router.post('/admin/api/changeapikeys', async (req, res) => {
  try {
    if (!sqlAuth(req, res))
      return

    const { apikey } = req.body as { apikey: string }
    process.env.OPENAI_API_KEY = apikey
    res.send({ status: 'Success', message: '操作成功', data: null })
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

app.use('', router)
app.use('/api', router)
app.set('trust proxy', 1)

app.listen(3002, () => globalThis.console.log('Server is running on port 3002'))
