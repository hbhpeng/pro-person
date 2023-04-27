import type { Router } from 'vue-router'
import { useAuthStoreWithout } from '@/store/modules/auth'

const adminAuthPage = ['user']
export function setupPageGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStoreWithout()

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
        return item === to.name
      })
      if (index !== -1) {
        next({ name: from.name ?? 'Root' })
        return
      }
    }

    if (!authStore.session) {
      try {
        const data = await authStore.getSession()
        if (String(data.auth) === 'false' && authStore.token)
          authStore.removeToken()

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
