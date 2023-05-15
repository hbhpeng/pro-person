<script setup lang="ts">
import { computed, defineEmits, defineProps, reactive, ref, unref, watch } from 'vue'
import { NMenu } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { asyncRoutes } from '@/router/index'

defineProps({
  collapsed: Boolean,
})

const emit = defineEmits<Emit>()
interface Emit {
  (e: 'clickMenuItem', key: any): void
}
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
const selectedKeys = ref<string>(currentRoute.name as string)
// 获取当前打开的子菜单
const matched = currentRoute.matched

const getOpenKeys = ((matched && matched.length) ? matched.map(item => item.name) : []) as any

const state = reactive({
  openKeys: getOpenKeys,
})

const getSelectedKeys = computed(() => {
  return unref(selectedKeys)
})

watch(
  () => currentRoute.fullPath,
  () => {
    updateSelectedKeys()
  },
)

function updateSelectedKeys() {
  const matched = currentRoute.matched
  state.openKeys = matched.map(item => item.name)
  const activeMenu: string = (currentRoute.meta?.activeMenu as string) || ''
  selectedKeys.value = activeMenu ? (activeMenu as string) : (currentRoute.name as string)
}

// 点击菜单
function clickMenuItem(key: string) {
  if (/http(s)?:/.test(key))
    window.open(key)
  else
    router.push({ name: key })

  emit('clickMenuItem' as any, key)
}
// 展开菜单
function menuExpanded(openKeys: string[]) {
  if (!openKeys)
    return
  const latestOpenKey = openKeys.find(key => !state.openKeys.includes(key))
  const isExistChildren = findChildrenLen(latestOpenKey as string)
  state.openKeys = isExistChildren ? (latestOpenKey ? [latestOpenKey] : []) : openKeys as any
}
// 查找是否存在子路由
function findChildrenLen(key: string) {
  if (!key)
    return false
  const subRouteChildren: string[] = []
  for (const { children, key } of unref(menus)) {
    if (children && children.length)
      subRouteChildren.push(key as string)
  }
  return subRouteChildren.includes(key)
}
</script>

<template>
  <NMenu
    :options="menus" :inverted="false" mode="vertical" :collapsed="collapsed" :collapsed-width="64"
    :collapsed-icon-size="20" :indent="24" :expanded-keys="state.openKeys" :value="getSelectedKeys"
    @update:value="clickMenuItem" @update:expanded-keys="menuExpanded"
  />
</template>
