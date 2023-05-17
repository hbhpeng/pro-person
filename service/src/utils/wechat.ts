import fs from 'fs'
import path from 'path'
import axios from 'axios'
import tenpay from 'tenpay'
import xml2js from 'xml2js'

export const MCHID = '1644083736'
const partnerV2Key = '31ae470b212fde09afc98G41ccb7ef7z'
export const APPID = 'wxd7c431bcd85e0e80'
const APPSECRET = 'e0f5b8f87771b269b523c618d21bebe8'
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
