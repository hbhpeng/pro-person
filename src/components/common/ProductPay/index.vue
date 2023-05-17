<script setup lang='ts'>
import {
  computed,
  // onMounted,
  ref,
  watch,
} from 'vue'
import {
  NModal,
  NSpin,
  useMessage,
} from 'naive-ui'
import '@/typings/global.d.ts'
import ProductList from './ProductList/index.vue'
import BindWechat from './BindWechat/index.vue'
import {
  getSingleUserInfo,
  userGetProductPayParams,
} from '@/api'
import {
  useAuthStoreWithout,
} from '@/store/modules/auth'

const props = defineProps < Props > ()
const emits = defineEmits < Emit > ()
const authStore = useAuthStoreWithout()
let userToken = authStore.$state.userToken

watch(
  () => authStore.$state.userToken,
  (value: any) => {
    userToken = value
  }, {
    deep: true,
  },
)

const ms = useMessage()
const loading = ref(false)

interface Emit {
  (e: 'createOrder'): void
  (e: 'update:visible', visible: boolean): void
  (e: 'payShouldLogin'): void
}
interface Props {
  visible: boolean
}
const showModal = computed({
  get: () => props.visible,
  set: (visible: boolean) => emits('update:visible', visible),
})
const payParams = ref()
const showWechat = ref(false)

watch(
  () => showModal,
  (value) => {
    if (!value.value)
      showWechat.value = false
  }, {
    deep: true,
  },
)

const initPayParams = async () => {
  loading.value = true
  try {
    const {
      data,
    } = await userGetProductPayParams()
    const dataObject = JSON.parse(data as string)
    // 初始化支付参数return { appId, timeStamp, nonceStr, packageStr, signType, signature }
    payParams.value = {
      appId: dataObject.appId,
      timeStamp: dataObject.timeStamp,
      nonceStr: dataObject.nonceStr,
      package: dataObject.package,
      signType: dataObject.signType,
      paySign: dataObject.paySign,
    }
    // // 开始轮询
    // queryCount = 0
    // startQueryLoginInfo()
  }
  finally {
    loading.value = false
  }
}

const pay = () => {
  if (typeof window.WeixinJSBridge === 'undefined') {
    ms.info('请在微信客户端打开本页面')
    return
  }

  if (!payParams.value) {
    ms.error('支付参数未初始化')
    return
  }

  window.WeixinJSBridge.invoke('getBrandWCPayRequest', {
    appId: payParams.value.appId,
    timeStamp: `${payParams.value.timeStamp}`,
    nonceStr: payParams.value.nonceStr,
    package: payParams.value.package,
    signType: payParams.value.signType,
    paySign: payParams.value.paySign,
  }, (res: any) => {
    if (res.err_msg === 'get_brand_wcpay_request:ok') {
      showModal.value = false
      ms.success('用的开心😁')
    }
  })
}

async function closeAndCreateOrder() {
  const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  if (isMobile) {
    try {
      await initPayParams()
      pay()
    }
    catch (error: any) {
      ms.error(error.message)
    }
  }
  else {
    emits('createOrder')
  }
}

async function userWantPay(product: any) {
  // console.log(product)
  if (!userToken) {
    ms.info('请先登录吧')
    emits('payShouldLogin')
    return
  }
  try {
    loading.value = true
    const {
      data,
    } = await getSingleUserInfo()
    const userInfo = JSON.parse(data as string)
    if (!userInfo.openid) {
      showWechat.value = true
      return
    }
  }
  catch {
    ms.error('网络好像有点问题，稍后重试吧')
  }
  finally {
    loading.value = false
  }
  closeAndCreateOrder()
}

function bindSuccess() {
  userWantPay('123')
  showWechat.value = false
}
</script>

<template>
  <NModal v-model:show="showModal" class="custom-card" title="支付" size="huge">
    <NSpin :show="loading">
      <ProductList v-if="!showWechat" @user-want-pay="userWantPay" />
      <BindWechat v-else v-model:visible="showWechat" @bind-success="bindSuccess" />
    </NSpin>
  </NModal>
</template>

<style>
</style>
