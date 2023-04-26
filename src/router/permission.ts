import type { Router } from 'vue-router'
import { useAuthStoreWithout } from '@/store/modules/auth'

const adminAuthPage = ['user']
export function setupPageGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStoreWithout()
    if (!authStore.session) {
      try {
        const data = await authStore.getSession()
        if (String(data.auth) === 'false' && authStore.token)
          authStore.removeToken()

        // 判断管理员登录状态
        const adminToken = authStore.$state.adminToken
        if (adminToken) {
          if (to.name === 'admin') {
            next({ name: 'user' })
            return
          }
        }
        else {
          const index = adminAuthPage.findIndex((item) => {
            return item === 'user'
          })
          if (index !== -1) {
            next({ name: from.name ?? 'admin' })
            return
          }
        }

        if (to.path === '/500')
          next({ name: 'Root' })
        else
          next()
      }
      catch (error) {
        if (to.path !== '/500')
          next({ name: '500' })
        else
          next()
      }
    }
    else {
      next()
    }
  })
}
