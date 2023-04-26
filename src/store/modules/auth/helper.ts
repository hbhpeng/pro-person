import { ss } from '@/utils/storage'

const LOCAL_NAME = 'SECRET_TOKEN'
const LOCAL_USER_NAME = 'USER_TOKEN'
const LOCAL_ADMAIN_NAME = 'ADMAIN_TOKEN'

export function getToken() {
  return ss.get(LOCAL_NAME)
}

export function setToken(token: string) {
  return ss.set(LOCAL_NAME, token)
}

export function removeToken() {
  return ss.remove(LOCAL_NAME)
}

export function getUserToken() {
  return ss.get(LOCAL_USER_NAME)
}

export function setUserToken(token: string) {
  return ss.set(LOCAL_USER_NAME, token)
}

export function removeUserToken() {
  return ss.remove(LOCAL_USER_NAME)
}

export function getAdmainToken() {
  return ss.get(LOCAL_ADMAIN_NAME)
}

export function setAdmainToken(token: string) {
  return ss.set(LOCAL_ADMAIN_NAME, token)
}

export function removeAdmainToken() {
  return ss.remove(LOCAL_ADMAIN_NAME)
}
