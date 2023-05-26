import { createHash } from 'crypto'
import moment from 'moment'
import QuickLRU from 'quick-lru'

const qaCache = new QuickLRU({ maxSize: 30000, maxAge: 60 * 60 * 24 * 1000 })

function generateSessionId(length = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-={}[]|;:<>,.?/~`'
  const charLength = chars.length
  let sessionId = ''

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charLength)
    sessionId += chars[randomIndex]
  }

  const hash = createHash('sha256')
  hash.update(sessionId)

  let str = hash.digest('hex')
  if (process.env.YUAN_YUAN_FENXIAO_ID)
    str = `${process.env.YUAN_YUAN_FENXIAO_ID}_${str}`

  if (str.length > 60)
    return str.substring(0, 58)

  return str
}

export function createAndCacheSessionId() {
  let sessionId = generateSessionId()
  let count = 0
  while (qaCache.has(sessionId) && count++ < 5)
    sessionId = generateSessionId()

  if (count >= 5)
    return '0'

  qaCache.set(sessionId, { islogin: 0 })
  return sessionId
}

export function hasSessionId(sessionId: string) {
  return qaCache.has(sessionId)
}

export function loginCheckSessionId(sessionId: string, username?: string) {
  if (sessionId === '0')
    return false
  if (username)
    qaCache.set(sessionId, { islogin: 0, username })
  else
    qaCache.set(sessionId, { islogin: 0 })
  return true
}

export function loginedWithSessionId(sessionId: string, username: string) {
  if (sessionId)
    qaCache.set(sessionId, { islogin: 2, username })
}

export function getValueWithSessionId(sessionId: string) {
  if (sessionId === '0')
    return {}

  return qaCache.get(sessionId)
}

export function getFenXiaoWithSessionId(sessionId: string) {
  const result = sessionId.split('_')
  if (result.length > 0) {
    if (result[0].length < 6)
      return result[0]
  }
  return ''
}

export function turnOpenidToNormal(openid: string) {
  const index = openid.indexOf('_')
  if (index !== -1) {
    const result = openid.substring(0, index)
    if (result.length < 6)
      return openid.substring(index + 1)
  }
  return openid
}

export function turnDayTimeToNoraml(vipendday: string) {
  let day = vipendday
  if (day)
    day = moment(vipendday).format('YYYY-MM-DD HH:mm:ss')

  else
    day = ''

  return day
}
