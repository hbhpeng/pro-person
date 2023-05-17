<script setup lang='ts'>
import {
  computed,
  ref,
  watch,
} from 'vue'
import {
  NButton,
  NCard,
  NModal,
  NSpace,
  NSpin,
  useMessage,
} from 'naive-ui'
import QRCode from 'qrcode'
import {
  userCheckPayState,
  userWitchScanPayUrls,
} from '@/api'

const props = defineProps < Props > ()

const emits = defineEmits < Emit > ()

const bodyStyle = ref({
  width: '400px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
})

interface Emit {
  (e: 'update:visible', visible: boolean): void
}
interface Props {
  visible: boolean
}
const loading = ref(false)
const qrcodeDataUrl = ref('')
const ms = useMessage()
const orderId = ref('')

const showModal = computed({
  get: () => props.visible,
  set: (visible: boolean) => emits('update:visible', visible),
})

const getOrderWxImage = async () => {
  loading.value = true
  try {
    const {
      message: url,
      data,
    } = await userWitchScanPayUrls()
    const result = JSON.parse(data as string)
    orderId.value = result.orderId
    // @ts-expect-error library need
    QRCode.toDataURL(url, {
      width: 200,
      height: 200,
      colorDark: '#000000',
      colorLight: '#ffffff',
    }, (err, url: string) => {
      if (!err)
        qrcodeDataUrl.value = url
      else
        qrcodeDataUrl.value = ''
    })

    // // 开始轮询
    // queryCount = 0
    // startQueryLoginInfo()
  }
  catch (error: any) {

  }
  finally {
    loading.value = false
  }
}

watch(
  () => showModal,
  (value) => {
    if (value.value)
      getOrderWxImage()
  }, {
    deep: true,
  },
)
// const is_weixin = () => {
// return /MicroMessenger/.test(navigator.userAgent)
// }
async function checkIsPay() {
  try {
    await userCheckPayState(orderId.value)
    ms.success('用的开心😁')
    showModal.value = false
  }
  catch (error: any) {
    ms.error(error.message)
  }
}
</script>

<template>
  <NModal v-model:show="showModal" class="custom-card" title="支付" size="huge">
    <NSpin :show="loading">
      <NCard :style="bodyStyle" title="支付" :bordered="false" size="huge" role="dialog" aria-modal="true">
        <NSpace :style="bodyStyle">
          <div>打开微信扫一扫完成支付</div>
          <img ref="qrcodeRef" style="width: 250px;height: 250px;" :src="qrcodeDataUrl" alt="...">
          <NButton type="primary" @click="checkIsPay">
            我已完成支付
          </NButton>
        </NSpace>
      </NCard>
    </NSpin>
  </NModal>
</template>

<style>
</style>
