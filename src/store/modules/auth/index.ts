import { defineStore } from 'pinia'
import { getAdmainToken, getToken, getUserToken, removeAdmainToken, removeToken, setAdmainToken, setToken } from './helper'
import { store } from '@/store'
import { fetchSession } from '@/api'

interface SessionResponse {
  auth: boolean
  model: 'ChatGPTAPI' | 'ChatGPTUnofficialProxyAPI'
}

export interface AuthState {
  token: string | undefined
  session: SessionResponse | null
  userToken: string | undefined
  adminToken: string | undefined
}

export const useAuthStore = defineStore('auth-store', {
  state: (): AuthState => ({
    token: getToken(),
    session: null,
    userToken: getUserToken(),
    adminToken: getAdmainToken(),
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
  },
})

export function useAuthStoreWithout() {
  return useAuthStore(store)
}
