<script setup lang="ts">
import { reactive, ref } from 'vue'
import { NMenu } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { asyncRoutes } from '@/router/index'

const menus = ref<any[]>([])
menus.value = generatorMenu(asyncRoutes)

function generatorMenu(routerMap: Array<any>) {
  return routerMap.map((item) => {
    const info = item
    const currentMenu = {
      ...info,
      ...info.meta,
      label: info.meta?.title,
      key: info.name,
      icon: item.meta?.icon,
    }
    // 是否有子菜单，并递归处理
    if (info.children && info.children.length > 0) {
      // Recursion
      currentMenu.children = generatorMenu(info.children)
    }
    return currentMenu
  })
}
// 当前路由
const currentRoute = useRoute()
const router = useRouter()
// 获取当前打开的子菜单
const matched = currentRoute.matched

const getOpenKeys = (matched && matched.length) ? matched.map(item => item.name) : []

const state = reactive({
  openKeys: getOpenKeys,
})
</script>

<template>
  <NMenu
    :options="menus"
    :inverted="false"
    :mode="mode"
    :collapsed="collapsed"
    :collapsed-width="64"
    :collapsed-icon-size="20"
    :indent="24"
    :expanded-keys="openKeys"
    :value="getSelectedKeys"
    @update:value="clickMenuItem"
    @update:expanded-keys="menuExpanded"
  />
</template>
