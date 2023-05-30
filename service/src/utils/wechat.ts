import fs from 'fs'
import path from 'path'
import axios from 'axios'
import tenpay from 'tenpay'
import xml2js from 'xml2js'

const forceCData = '<FORCECDATA>'

export const APPTOKEN = 'jhyuanyouyuankeji'
export const MCHID = '1644083736'
const partnerV2Key = '31ae470b212fde09afc98G41ccb7ef7z'
export const APPID = 'wxd7c431bcd85e0e80'
const APPSECRET = 'e0f5b8f87771b269b523c618d21bebe8'
let createAccountMenu = false
let queryTime = 0
let failTryCount = 0

let publicPath = path.resolve(__dirname, '..', '..', 'paycer', 'apiclient_cert.p12')
if (!fs.existsSync(publicPath))
  publicPath = path.resolve(__dirname, '..', 'paycer', 'apiclient_cert.p12')

const config = {
  appid: APPID,
  mchid: MCHID,
  partnerKey: partnerV2Key,
  pfx: fs.readFileSync(publicPath),
  notify_url: 'http://usa1y.studentgpt.top/wxpay/notify',
  spbill_create_ip: '185.149.23.85',
}
const TenPayAlias = tenpay
export const payApi = new TenPayAlias(config, true)

const http = axios.create({
  baseURL: 'https://api.weixin.qq.com/cgi-bin',
})

export const createWechatOfficialAccountMenu = async () => {
  if (createAccountMenu)
    return
  const url = `/menu/create?access_token=${process.env.wechatToken}`
  const data = {
    button: [
      {
        type: 'view',
        name: 'chatgpt',
        key: 'menu_chatgpt_click',
        url: 'http://usa1y.studentgpt.top/',
      },
    ],
  }
  const config = {
    headers: { 'Content-Type': 'application/json' },
  }
  const response = await http.post(url, data, config)
  // console.log(response)
  if (response.data.errcode === 0)
    createAccountMenu = true
}

const getWeChatAccessToken = async () => {
  // 使用axios发起GET请求获取access_token
  const token = await http.get(`/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`)
    .then((response) => {
      failTryCount = 0
      // console.log(response.data)
      if (response.data.errcode)
        throw new Error('出错了')

      queryTime = response.data.expires_in * 1000 - 15 * 60 * 1000
      return response.data.access_token
    })
  process.env.wechatToken = token

  await createWechatOfficialAccountMenu()
  // console.log(process.env.wechatToken)
}

export const startQueryAccessToken = async () => {
  try {
    await getWeChatAccessToken()
    setTimeout(startQueryAccessToken, queryTime)
  }
  catch (error) {
    failTryCount++
    queryTime = failTryCount * 1000
    if (failTryCount > 60)
      failTryCount = 0
    setTimeout(startQueryAccessToken, queryTime)
  }
}

export const getWechatOfficialQrcode = async (sessionid: string) => {
  const url = `/qrcode/create?access_token=${process.env.wechatToken}`
  const data = {
    expire_seconds: 5 * 60,
    action_name: 'QR_STR_SCENE',
    action_info: {
      scene: { scene_str: sessionid },
    },
  }
  const config = {
    headers: { 'Content-Type': 'application/json' },
  }
  const response = await http.post(url, data, config)
  // const ticket = response.data.ticket
  // const expireSeconds = response.data.expire_seconds
  // console.log(response.data)
  const qrCodeUrl = response.data.url
  return qrCodeUrl
}

export const scanLoginedSessionId = async (sessionid: string) => {

}

export const replyPayData = async (message?: string) => {
  const opt = { xmldec: null, rootName: 'xml', allowSurrogateChars: true, cdata: true }
  if (message)
    return new xml2js.Builder(opt).buildObject({ return_code: 'SUCCESS' })

  else
    return new xml2js.Builder(opt).buildObject({ return_code: 'FAIL', return_msg: message })
}

export const getWechatPayParam = (prepay_id: string) => {
  // let privatePath = publicPath.replace('apiclient_cert.p12', 'apiclient_key.pem')

  // const appId = APPID
  // const timeStamp = Date.now()
  // const nonceStr = uuidv4().slice(0, 8)
  // const packageStr = `prepay_id=${prepay_id}`
  // const signType = 'RSA'

  // // 读取私钥文件
  // const privateKey = fs.readFileSync(privatePath, 'utf8')

  // // 创建签名对象并传入要签名的算法、私钥和待签名的数据
  // const signer = crypto.createSign('RSA-SHA256');
  // signer.update(`${appId}\n${timeStamp}\n${nonceStr}\n${packageStr}\n`);
  // signer.end();
  // const signature = signer.sign(privateKey, 'base64')
  // return { appId, timeStamp, nonceStr, packageStr, signType, signature }
  return payApi.getPayParamsByPrepay({ prepay_id })
}

export const replySubscribeData = (from: string, to: string) => {
  const content = `非常感谢您关注我们的公众号！我们是一家专注于跨境电商和ChatGPT相关内容的平台。我们致力于为广大用户提供最新、最有价值的跨境电商行业动态和ChatGPT应用技巧，帮助大家更好地了解这个行业并获取成功。作为一家专业的平台，我们拥有一支充满活力和创新精神的团队，他们都有着丰富的实战经验和深厚的专业知识。我们将不断探索新的领域，不断推出更加优质的内容，为广大读者打造一个全面、权威、有趣、易懂的跨境电商和ChatGPT学习平台。同时，我们提供：

1 海外VPS代理/搭建

2 ChatGPT镜像站分销/搭建

3 独立站搭建

4 微信小程序制

5 App应用制作`
  const opt = { xmldec: null, rootName: 'xml', allowSurrogateChars: true, cdata: true }
  const reply = new xml2js.Builder(opt).buildObject({ FromUserName: from + forceCData, ToUserName: to + forceCData, CreateTime: Date.now(), MsgType: `text${forceCData}`, Content: `${content}${forceCData}` })
  const finalReply = reply.replace(new RegExp(forceCData, 'g'), '')
  return finalReply
}

export const replyUserSendMessageData = (xmlData: any) => {
  const opt = { xmldec: null, rootName: 'xml', allowSurrogateChars: true, cdata: true }
  const reply = new xml2js.Builder(opt).buildObject({
    FromUserName: xmlData.tousername[0] + forceCData,
    ToUserName: xmlData.fromusername[0] + forceCData,
    CreateTime: Date.now(),
    MsgType: `text${forceCData}`,
    Content: `ChatGPT 1分钱享用 https://aichat.apetech.monster${forceCData}`,
  })
  const finalReply = reply.replace(new RegExp(forceCData, 'g'), '')
  return finalReply
}
