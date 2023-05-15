import type { RouteRecordRaw } from 'vue-router'
import { AdminLayout } from '@/views/admin/constant'
// import { DashboardOutlined } from '@vicons/antd';
import { renderIcon } from '@/utils/functions/index'

const routeName = 'package'

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
    path: '/package',
    name: routeName,
    redirect: '/package/manage',
    component: AdminLayout,
    meta: {
      title: '用户套餐',
      icon: renderIcon('mdi:package-outline'),
      permissions: ['package_manage'],
      sort: 3,
    },
    children: [
      {
        path: 'manage',
        name: `${routeName}_manage`,
        meta: {
          title: '套餐管理',
          keepAlive: true,
          permissions: ['package_manage'],
        },
        component: () => import('@/views/admin/package/manage/index.vue'),
      },
    ],
  },
]

export default routes
