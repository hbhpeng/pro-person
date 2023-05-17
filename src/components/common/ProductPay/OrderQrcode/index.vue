<script setup lang='ts'>
import {
  computed,
  ref,
  watch,
} from 'vue'
import {
  NCard,
  NModal,
  NSpace,
  NSpin,
} from 'naive-ui'
import QRCode from 'qrcode'
import {
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

const showModal = computed({
  get: () => props.visible,
  set: (visible: boolean) => emits('update:visible', visible),
})

const getOrderWxImage = async () => {
  loading.value = true
  try {
    const {
      message: url,
    } = await userWitchScanPayUrls()
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
</script>

<template>
  <NModal v-model:show="showModal" class="custom-card" title="支付" size="huge">
    <NSpin :show="loading">
      <NCard :style="bodyStyle" title="支付" :bordered="false" size="huge" role="dialog" aria-modal="true">
        <NSpace :style="bodyStyle">
          <div>微信支付</div>
          <img ref="qrcodeRef" style="width: 250px;height: 250px;" :src="qrcodeDataUrl" alt="...">
        </NSpace>
      </NCard>
    </NSpin>
  </NModal>
</template>

<style>
</style>
