import { defineStore } from 'pinia'
import { getAdmainToken, getToken, getUserToken, removeAdmainToken, removeToken, removeUserToken, setAdmainToken, setToken, setUserToken } from './helper'
import { store } from '@/store'
import { fetchSession } from '@/api'
import { ss } from '@/utils/storage'

interface SessionResponse {
  auth: boolean
  model: 'ChatGPTAPI' | 'ChatGPTUnofficialProxyAPI'
  sessionid: string
}

export interface AuthState {
  token: string | undefined
  session: SessionResponse | null
  userToken: string | undefined
  adminToken: string | undefined
  sessionid: string | undefined
}

export const useAuthStore = defineStore('auth-store', {
  state: (): AuthState => ({
    token: getToken(),
    session: null,
    userToken: getUserToken(),
    adminToken: getAdmainToken(),
    sessionid: ss.get('sessionid'),
  }),

  getters: {
    isChatGPTAPI(state): boolean {
      return state.session?.model === 'ChatGPTAPI'
    },
  },

  actions: {
    async getSession() {
      try {
        const { data } = await fetchSession<SessionResponse>()
        this.session = { ...data }
        if (this.session?.sessionid) {
          this.sessionid = this.session?.sessionid
          ss.set('sessionid', this.session?.sessionid)
        }
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
    },

    setToken(token: string) {
      this.token = token
      setToken(token)
    },

    removeToken() {
      this.token = undefined
      removeToken()
    },

    removeAdminT() {
      this.adminToken = undefined
      removeAdmainToken()
    },

    setAdmainT(token: string) {
      this.adminToken = token
      setAdmainToken(token)
    },

    removeUserT() {
      this.userToken = undefined
      removeUserToken()
    },

    setUserT(token: string) {
      this.userToken = token
      setUserToken(token)
    },
  },
})

export function useAuthStoreWithout() {
  return useAuthStore(store)
}
