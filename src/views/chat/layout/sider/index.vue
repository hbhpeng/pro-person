<script setup lang='ts'>
import type {
  CSSProperties,
} from 'vue'
import {
  computed,
  ref,
  watch,
} from 'vue'
import {
  NButton,
  NLayoutSider,
} from 'naive-ui'
import List from './List.vue'
import Footer from './Footer.vue'
import {
  useAppStore,
  useChatStore,
} from '@/store'
import {
  useAuthStoreWithout,
} from '@/store/modules/auth'
import {
  useBasicLayout,
} from '@/hooks/useBasicLayout'
import {
  MakePPT,
  OrderQrcode,
  PersonInfo,
  ProductPay,
  PromptStore,
  UserInfo,
} from '@/components/common'
import { router } from '@/router'

const appStore = useAppStore()
const chatStore = useChatStore()
const authStore = useAuthStoreWithout()
const userToken = authStore.$state.userToken

const {
  isMobile,
} = useBasicLayout()
const show = ref(false)
const loginBtShow = ref(false)
const loginVwShow = ref(false)
const personVwShow = ref(false)
const aiPPTShow = ref(false)
const payShow = ref(false)
const orderImgShow = ref(false)

if (!userToken)
  loginBtShow.value = true

watch(
  () => authStore.$state.userToken,
  (value: any) => {
    if (value)
      loginBtShow.value = false

    else
      loginBtShow.value = true
  }, {
    deep: true,
  },
)

const collapsed = computed(() => appStore.siderCollapsed)
const canAddFileChat = computed(() => {
  for (const his of chatStore.history) {
    if (his.isFile)
      return false
  }
  return true
})

function handleAdd() {
  chatStore.addHistory({
    title: 'New Chat',
    uuid: Date.now(),
    isEdit: false,
  })
  if (isMobile.value)
    appStore.setSiderCollapsed(true)
}

function handleAddFileQA() {
  chatStore.addHistory({
    title: 'New Chat',
    uuid: Date.now(),
    isEdit: false,
    isFile: true,
  })
  if (isMobile.value)
    appStore.setSiderCollapsed(true)
}

function handleUpdateCollapsed() {
  appStore.setSiderCollapsed(!collapsed.value)
}

const getMobileClass = computed < CSSProperties > (() => {
  if (isMobile.value) {
    return {
      position: 'fixed',
      zIndex: 50,
    }
  }
  return {}
})

const mobileSafeArea = computed(() => {
  if (isMobile.value) {
    return {
      paddingBottom: 'env(safe-area-inset-bottom)',
    }
  }
  return {}
})

watch(
  isMobile,
  (val) => {
    appStore.setSiderCollapsed(val)
  }, {
    immediate: true,
    flush: 'post',
  },
)

const showChongZhi = () => {
  // window.alert('请联系微信13210119727')
  payShow.value = true
}

const createOrder = () => {
  payShow.value = false
  orderImgShow.value = true
}

const moreFunctions = () => {
  router.push({ name: 'morev' })
}
</script>

<template>
  <NLayoutSider
    :collapsed="collapsed" :collapsed-width="0" :width="260"
    :show-trigger="isMobile ? false : 'arrow-circle'" collapse-mode="transform" position="absolute" bordered
    :style="getMobileClass" @update-collapsed="handleUpdateCollapsed"
  >
    <div class="flex flex-col h-full" :style="mobileSafeArea">
      <main class="flex flex-col flex-1 min-h-0">
        <div class="p-4">
          <NButton dashed block @click="handleAdd">
            {{ $t('chat.newChatButton') }}
          </NButton>
          <NButton v-if="canAddFileChat" dashed block style="margin-top: 5px;" @click="handleAddFileQA">
            +新建文件解答
          </NButton>
        </div>
        <div class="flex-1 min-h-0 pb-4 overflow-hidden">
          <List />
        </div>
        <div class="p-1">
          <NButton block @click="moreFunctions">
            更多功能
          </NButton>
        </div>
        <div class="p-1">
          <NButton block @click="show = true">
            {{ $t('store.siderButton') }}
          </NButton>
        </div>
        <div class="p-1">
          <NButton block @click="aiPPTShow = true">
            AI制作ppt
          </NButton>
        </div>
        <div class="p-1">
          <NButton block @click="showChongZhi">
            充值字数
          </NButton>
        </div>
        <div v-if="loginBtShow" class="p-1">
          <NButton block @click="loginVwShow = true">
            立即登录
          </NButton>
        </div>
        <div v-else class="p-1">
          <NButton block @click="personVwShow = true">
            个人中心
          </NButton>
        </div>
      </main>
      <Footer />
    </div>
  </NLayoutSider>
  <template v-if="isMobile">
    <div v-show="!collapsed" class="fixed inset-0 z-40 bg-black/40" @click="handleUpdateCollapsed" />
  </template>
  <PromptStore v-model:visible="show" />
  <UserInfo v-model:visible="loginVwShow" />
  <PersonInfo v-model:visible="personVwShow" />
  <MakePPT v-model:visible="aiPPTShow" />
  <ProductPay v-model:visible="payShow" @create-order="createOrder" />
  <OrderQrcode v-model:visible="orderImgShow" />
</template>
