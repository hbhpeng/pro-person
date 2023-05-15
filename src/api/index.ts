import type { AxiosProgressEvent, GenericAbortSignal } from 'axios'
import { get, post } from '@/utils/request'
import { useAuthStore, useSettingStore } from '@/store'

export function fetchChatAPI<T = any>(
  prompt: string,
  options?: { conversationId?: string; parentMessageId?: string },
  signal?: GenericAbortSignal,
) {
  return post<T>({
    url: '/chat',
    data: { prompt, options },
    signal,
  })
}

export function fetchChatConfig<T = any>() {
  return post<T>({
    url: '/config',
  })
}

export function fetchChatAPIProcess<T = any>(
  params: {
    prompt: string
    options?: { conversationId?: string; parentMessageId?: string }
    signal?: GenericAbortSignal
    onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void
  },
) {
  const settingStore = useSettingStore()
  const authStore = useAuthStore()

  let data: Record<string, any> = {
    prompt: params.prompt,
    options: params.options,
  }

  if (authStore.isChatGPTAPI) {
    data = {
      ...data,
      systemMessage: settingStore.systemMessage,
      temperature: settingStore.temperature,
      top_p: settingStore.top_p,
      password: settingStore.password,
    }
  }

  return post<T>({
    url: '/chat-process',
    data,
    signal: params.signal,
    onDownloadProgress: params.onDownloadProgress,
  })
}

export function fetchSession<T>() {
  return post<T>({
    url: '/session',
  })
}

export function fetchVerify<T>(token: string) {
  return post<T>({
    url: '/verify',
    data: { token },
  })
}

export function addPassword<T>(token: string, admin: string) {
  return post<T>({
    url: '/addPasswd',
    data: { token, admin },
  })
}

export function removePassword<T>(token: string, admin: string) {
  return post<T>({
    url: '/removePasswd',
    data: { token, admin },
  })
}

export function changeOpenApi<T>(apikey: string) {
  return post<T>({
    url: '/admin/api/changeapikeys',
    data: { apikey },
  })
}

export function reqOpenApiKeys<T>() {
  return post<T>({
    url: '/admin/api/getapikeys',
  })
}

export function deleteOpenApi<T>(apikey: string) {
  return post<T>({
    url: '/admin/api/deleteapikeys',
    data: { apikey },
  })
}

export function addOrUpdateUserInfo<T>(username: string, password: string, usagecount: number,
  usecount: number, userid: number, admin: string, isupdate: boolean) {
  if (isupdate) {
    return post<T>({
      url: '/admin/user/adduser',
      data: { username, userid: -1, password, usagecount, usecount, admin },
    })
  }
  else {
    return post<T>({
      url: '/admin/user/adduser',
      data: { username, userid, password, usagecount, usecount, admin },
    })
  }
}

export function deleteUserInfo<T>(username: string, password: string, usagecount: number,
  usecount: number, userid: number, admin: string) {
  return post<T>({
    url: '/admin/user/deleteuser',
    data: { username, userid, password, usagecount, usecount, admin },
  })
}

export function getUserInfo<T>(page: number, pageSize: number, admin: string) {
  return post<T>({
    url: '/admin/user/getuser',
    data: { page, pageSize, admin },
  })
}

export function adminActionLogin<T>(username: string, password: string) {
  return post<T>({
    url: '/admin/login',
    data: { username, password },
  })
}

export function adminChangePassword<T>(username: string, oldpw: string, newpw: string) {
  return post<T>({
    url: '/admin/api/changepassword',
    data: { username, oldpw, newpw },
  })
}

export function getSingleUserInfo<T>() {
  return post<T>({
    url: '/user/getuserinfo',
    data: { uid: Math.random() % 20 },
  })
}

export function userActionLogin<T>(username: string, password: string) {
  return post<T>({
    url: '/user/login',
    data: { username, password },
  })
}

export function userWithScanIsLogin<T>() {
  return get<T>({
    url: '/user/islogin',
  })
}

export function userActionRegist<T>(username: string, password: string) {
  return post<T>({
    url: '/user/register',
    data: { username, password },
  })
}

export function getUserLoginWxImage<T>() {
  return get<T>({
    url: '/user/loginwximage',
  })
}

export function getPromotImage<T>(prompot: string, signal?: GenericAbortSignal) {
  return post<T>({
    url: '/chat/image',
    data: { prompot },
    signal,
  })
}

export function makePPTRequest<T>(topic: string, length: string) {
  return post<T>({
    url: '/chat/makeppt',
    data: { topic, length },
  })
}

export function downloadPPTRequest<T>() {
  return post<T>({
    url: '/file/downloadppt',
    data: { },
    responseType: 'blob',
  })
}

export function uploadQuestionFile<T>(file: string) {
  const formData = new FormData()
  formData.append('file', file)
  return post<T>({
    url: '/file/uploadqafile',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export function askFileQuestion<T>(question: string, signal?: GenericAbortSignal) {
  return post<T>({
    url: '/file/askquestion',
    data: { question },
    signal,
  })
}
