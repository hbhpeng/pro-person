import type { RouteRecordRaw } from 'vue-router'
import { AdminLayout } from '@/views/admin/constant'
// import { DashboardOutlined } from '@vicons/antd';
import { renderIcon } from '@/utils/functions/index'

const routeName = 'adminconfig'

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
    path: '/adminconfig',
    name: routeName,
    redirect: '/adminconfig/personal',
    component: AdminLayout,
    meta: {
      title: '设置页面',
      icon: renderIcon('material-symbols:home'),
      permissions: ['adminconfig_personal'],
      sort: 5,
    },
    children: [
      {
        path: 'personal',
        name: `${routeName}_personal`,
        meta: {
          title: '个人设置',
          keepAlive: true,
          permissions: ['adminconfig_personal'],
        },
        component: () => import('@/views/admin/setting/personal/index.vue'),
      },
    ],
  },
]

export default routes
