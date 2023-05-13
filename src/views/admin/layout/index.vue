<script setup lang='ts'>
import {
  computed,
  onMounted,
  ref,
} from 'vue'
import {
  NBackTop,
  NDrawer,
  NLayout,
  NLayoutContent,
  NLayoutHeader,
  NLayoutSider,
} from 'naive-ui'
import {
  MainView,
} from './components/Main'
import {
  AsideMenu,
} from './components/Menu'
import {
  PageHeader,
} from './components/Header/index'
import {
  useBasicLayout,
} from '@/hooks/useBasicLayout'

const getDarkTheme = ref(false)

const collapsed = ref < boolean > (false)

const menuWidth = ref(200)

const {
  isMobile,
} = useBasicLayout()

const fixedHeader = ref('absolute')

const fixedMenu = ref('absolute')

const isMultiTabs = ref(false)

const fixedMulti = ref(true)

const leftMenuWidth = computed(() => {
  return collapsed.value ? 64 : 200
})

const getMenuLocation = computed(() => {
  return 'left'
})

// 控制显示或隐藏移动端侧边栏
const showSideDrawer = computed({
  get: () => isMobile.value && collapsed.value,
  set: val => (collapsed.value = val),
})

// 判断是否触发移动端模式
const checkMobileMode = () => {
  if (document.body.clientWidth <= 800)
    isMobile.value = true
  else
    isMobile.value = false

  collapsed.value = false
}

const watchWidth = () => {
  const Width = document.body.clientWidth
  if (Width <= 950)
    collapsed.value = true
  else
    collapsed.value = false

  checkMobileMode()
}

onMounted(() => {
  checkMobileMode()
  window.addEventListener('resize', watchWidth)
})
</script>

<template>
  <NLayout class="layout" :position="fixedMenu" has-sider theme-color="#6AA1E7">
    <NLayoutSider
      v-if="
        !isMobile" show-trigger="bar" :position="fixedMenu" :collapsed="collapsed" collapse-mode="width"
      :collapsed-width="64" :width="leftMenuWidth" :native-scrollbar="false" :inverted="true"
      class="layout-sider" @collapse="collapsed = true" @expand="collapsed = false"
    >
      <div class="admin-logo">
        <h2>管理后台</h2>
      </div>
      <AsideMenu v-model:collapsed="collapsed" v-model:location="getMenuLocation" />
    </NLayoutSider>

    <NDrawer v-model:show="showSideDrawer" :width="menuWidth" placement="left" class="layout-side-drawer">
      <div>
        <h2>管理后台</h2>
      </div>
      <AsideMenu @clickMenuItem="collapsed = false" />
    </NDrawer>

    <NLayout>
      <NLayoutHeader :position="fixedHeader">
        <PageHeader v-model:collapsed="collapsed" />
      </NLayoutHeader>

      <NLayoutContent class="layout-content" :class="{ 'layout-default-background': getDarkTheme === false }">
        <div
          class="layout-content-main" :class="{
            'layout-content-main-fix': fixedMulti,
            'fluid-header': fixedHeader === 'static',
          }"
        >
          <div
            class="main-view noMultiTabs" :class="{
              'main-view-fix': fixedMulti,
              'mt-3': !isMultiTabs,
            }"
          >
            <MainView />
          </div>
        </div>
      </NLayoutContent>
      <NBackTop :right="100" />
    </NLayout>
  </NLayout>
</template>

<style lang="less" scoped>
.admin-logo {
display: flex;
align-items: center;
justify-content: center;
height: 64px;
line-height: 64px;
overflow: hidden;
white-space: nowrap;
font-size: 20px;
}

.layout {
display: flex;
flex-direction: row;
flex: auto;

&-default-background {
background: #f5f7f9;
}

.layout-sider {
min-height: 100vh;
box-shadow: 2px 0 8px 0 rgb(29 35 41 / 5%);
position: relative;
z-index: 13;
transition: all 0.2s ease-in-out;
}

.layout-sider-fix {
position: fixed;
top: 0;
left: 0;
}

.ant-layout {
overflow: hidden;
}

.layout-right-fix {
overflow-x: hidden;
padding-left: 200px;
min-height: 100vh;
transition: all 0.2s ease-in-out;
}

.layout-content {
flex: auto;
min-height: 100vh;
}

.n-layout-header.n-layout-header--absolute-positioned {
z-index: 11;
}

.n-layout-footer {
background: none;
}
}

.layout-content-main {
margin: 0 10px 10px;
position: relative;
padding-top: 64px;
}

.layout-content-main-fix {
padding-top: 64px;
}

.fluid-header {
padding-top: 0;
}

.main-view-fix {
padding-top: 44px;
}
</style>
