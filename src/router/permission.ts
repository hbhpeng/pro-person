import type { RouteRecordRaw, Router } from 'vue-router'
import type { IModuleType } from './types'
import { useAuthStoreWithout } from '@/store/modules/auth'

const modules = import.meta.glob<IModuleType>('./modules/**/*.ts', { eager: true })
export const routeModuleList: RouteRecordRaw[] = Object.keys(modules).reduce((list: any, key: any) => {
  const mod = modules[key].default ?? {}
  const modList = Array.isArray(mod) ? [...mod] : [mod]
  return [...list, ...modList]
}, [])

const adminAuthPage = routeModuleList.map((item) => {
  return item.children
}).flat(1)
export function setupPageGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStoreWithout()

    // 判断管理员登录状态
    const adminToken = authStore.$state.adminToken
    if (adminToken) {
      if (to.name === 'admin' || to.name === 'user') {
        next({ name: 'dashboard' })
        return
      }
    }
    else {
      const index = adminAuthPage.findIndex((item) => {
        return item?.name === to.name
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
        // console.log(error)
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
