import type { RouteRecordRaw } from 'vue-router'
import { AdminLayout } from '@/views/admin/constant'
// import { DashboardOutlined } from '@vicons/antd';
import { renderIcon } from '@/utils/functions/index'

const routeName = 'dashboard'

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
    path: '/dashboard',
    name: routeName,
    redirect: '/dashboard/workplace',
    component: AdminLayout,
    meta: {
      title: '工作台',
      icon: renderIcon('material-symbols:home'),
      permissions: ['dashboard_workplace'],
      sort: 0,
    },
    children: [
      {
        path: 'workplace',
        name: `${routeName}_workplace`,
        meta: {
          title: '工作台',
          keepAlive: true,
          permissions: ['dashboard_workplace'],
        },
        component: () => import('@/views/admin/dashboard/workplace/workplace.vue'),
      },
    ],
  },
]

export default routes