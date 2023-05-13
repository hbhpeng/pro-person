import type { App } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'
import { setupPageGuard } from './permission'
import type { IModuleType } from './types'
import { ChatLayout } from '@/views/chat/layout'

const RedirectName = 'Redirect'

const modules = import.meta.glob<IModuleType>('./modules/**/*.ts', { eager: true })
const routeModuleList: RouteRecordRaw[] = Object.keys(modules).reduce((list: any, key: any) => {
  const mod = modules[key].default ?? {}
  const modList = Array.isArray(mod) ? [...mod] : [mod]
  return [...list, ...modList]
}, [])

function sortRoute(a: any, b: any) {
  return (a.meta?.sort ?? 0) - (b.meta?.sort ?? 0)
}

routeModuleList.sort(sortRoute)

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Root',
    component: ChatLayout,
    redirect: '/chat',
    children: [
      {
        path: '/chat/:uuid?/:fileType?',
        name: 'Chat',
        component: () => import('@/views/chat/index.vue'),
      },
    ],
  },

  {
    path: '/404',
    name: '404',
    component: () => import('@/views/exception/404/index.vue'),
  },

  {
    path: '/j_h_admin',
    name: 'admin',
    component: () => import('@/views/admin/login/index.vue'),
  },

  {
    path: '/j_h_admin/user',
    name: 'user',
    component: () => import('@/views/admin/layout/index.vue'),
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    redirect: '/404',
  },

  {
    path: '/preview',
    name: 'preview',
    component: () => import('@/components/common/Preview/index.vue'),
  },

  {
    path: '/moreview',
    name: 'morev',
    component: () => import('@/views/more/index.vue'),
  },

  {
    path: '/more/charts',
    name: 'more.chart',
    component: () => import('@/views/more/charts/index.vue'),
  },
]

export const RedirectRoute: RouteRecordRaw = {
  path: '/redirect',
  name: RedirectName,
  component: () => import('@/views/admin/layout/index.vue'),
  meta: {
    title: RedirectName,
    hideBreadcrumb: true,
  },
  children: [
    {
      path: '/redirect/:path(.*)',
      name: RedirectName,
      component: () => import('@/router/redirect/index.vue'),
      meta: {
        title: RedirectName,
        hideBreadcrumb: true,
      },
    },
  ],
}

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
})
// 添加跳转
router.addRoute(RedirectRoute)

setupPageGuard(router)

export async function setupRouter(app: App) {
  app.use(router)
  await router.isReady()
}

// 需要验证权限
export const asyncRoutes = [...routeModuleList]

asyncRoutes.forEach((item) => {
  router.addRoute(item as unknown as RouteRecordRaw)
})
