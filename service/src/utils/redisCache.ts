import { createHash } from 'crypto'
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

  return hash.digest('hex')
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

export function loginCheckSessionId(sessionId: string) {
  if (sessionId === '0')
    return false
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
