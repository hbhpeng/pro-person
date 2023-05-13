import axios from 'axios'

const APPID = 'wxd7c431bcd85e0e80'
const APPSECRET = 'e0f5b8f87771b269b523c618d21bebe8'
let queryTime = 0
let failTryCount = 0

const getWeChatAccessToken = async () => {
  // 使用axios发起GET请求获取access_token
  const token = await axios.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`)
    .then((response) => {
      failTryCount = 0
      queryTime = response.data.expires_in * 1000 - 15 * 60 * 1000
      return response.data.access_token
    })
  process.env.wechatToken = token
}

const startQueryAccessToken = async () => {
  try {
    setTimeout(getWeChatAccessToken, queryTime)
  }
  catch (error) {
    failTryCount++
    queryTime = failTryCount * 1000
    if (failTryCount > 60)
      failTryCount = 0
    startQueryAccessToken()
  }
}
