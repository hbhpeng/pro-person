import type { RouteRecordRaw } from 'vue-router'
import { AdminLayout } from '@/views/admin/constant'
// import { DashboardOutlined } from '@vicons/antd';
import { renderIcon } from '@/utils/functions/index'

const routeName = 'usermanager'

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
    path: '/usermanager',
    name: routeName,
    redirect: '/usermanager/userinfo',
    component: AdminLayout,
    meta: {
      title: '用户管理',
      icon: renderIcon('mdi:user-details'),
      permissions: ['usermanager_userinfo'],
      sort: 1,
    },
    children: [
      {
        path: 'userinfo',
        name: `${routeName}_userinfo`,
        meta: {
          title: '用户信息',
          keepAlive: true,
          permissions: ['usermanager_userinfo'],
        },
        component: () => import('@/views/admin/userInfo/userinfo/UserManager.vue'),
      },
    ],
  },
]

export default routes
