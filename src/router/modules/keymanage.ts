import type { RouteRecordRaw } from 'vue-router'
import { AdminLayout } from '@/views/admin/constant'
// import { DashboardOutlined } from '@vicons/antd';
import { renderIcon } from '@/utils/functions/index'

const routeName = 'aikey'

/**
 * @param name 路由名称, 必须设置,且不能重名
 * @param meta 路由元信息（路由附带扩展信息）
 * @param redirect 重定向地址, 访问这个路由时,自定进行重定向
 * @param meta.disabled 禁用整个菜单
 * @param meta.title 菜单名称
 * @param meta.icon 菜单图标
 * @param meta.keepAlive 缓存该路由
 * @param meta.sort 排序越小越排前
 * */
const routes: Array<RouteRecordRaw> = [
  {
    path: '/aikey',
    name: routeName,
    redirect: '/aikey/manage',
    component: AdminLayout,
    meta: {
      title: '秘钥管理',
      icon: renderIcon('ic:baseline-key'),
      permissions: ['aikey_manage'],
      sort: 4,
    },
    children: [
      {
        path: 'manage',
        name: `${routeName}_manage`,
        meta: {
          title: '秘钥池',
          keepAlive: true,
          permissions: ['aikey_manage'],
        },
        component: () => import('@/views/admin/keypool/keymanage/index.vue'),
      },
    ],
  },
]

export default routes
