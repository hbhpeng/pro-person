<script setup lang='ts'>
import {
  NButton,
  NCard,
  NEmpty,
  NSpin,
  useMessage,
} from 'naive-ui'
import {
  computed,
  onMounted,
  ref,
  watch,
} from 'vue'
import QRCode from 'qrcode'
import {
  getUserLoginWxImage,
  userWithScanIsLogin,
} from '@/api'

const props = defineProps < Props > ()

const emit = defineEmits < Emit > ()

interface Props {
  visible: boolean
}

interface Emit {
  (e: 'update:visible', visible: boolean): void
  (e: 'bindSuccess'): void
}

const showModal = computed({
  get: () => props.visible,
  set: (visible: boolean) => emit('update:visible', visible),
})

const ms = useMessage()
const loading = ref(false)
const qrcodeRef = ref(null)
const qrcodeDataUrl = ref('')
let queryCount = 0

const startQueryLoginInfo = async () => {
  try {
    queryCount++
    const { data } = await userWithScanIsLogin()
    // 解析一下报错就是没成功
    JSON.parse(data as string)
    emit('bindSuccess')
    ms.success('绑定成功')
  }
  catch {
    if (showModal.value && queryCount < 300)
      setTimeout(startQueryLoginInfo, 1000)
  }
}

const getLoginWxImage = async () => {
  loading.value = true
  try {
    const {
      message: url,
    } = await getUserLoginWxImage()
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

    // 开始轮询
    queryCount = 0
    startQueryLoginInfo()
  }
  catch (error: any) {
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  if (showModal.value) {
    queryCount = 0
    getLoginWxImage()
  }
})

watch(
  () => showModal,
  (value) => {
    if (value.value) {
      queryCount = 0
      getLoginWxImage()
    }
  }, {
    deep: true,
  },
)
</script>

<template>
  <NSpin :show="loading">
    <NCard class="modal-content" title="绑定账号" header-style="text-align: center">
      <div style="text-align: center;">
        微信扫描二维码关注公众号
      </div>
      <div style="text-align: center;font-size: 10px; color: gray;">
        已用微信注册过的无法绑定哦
      </div>

      <div ref="qrcodeRef" class="scan-code-container" style="margin-top: 20px;">
        <img v-if="qrcodeDataUrl" ref="qrcodeRef" style="width: 250px;height: 250px;" :src="qrcodeDataUrl" alt="...">
        <NEmpty v-else style="width: 250px;margin-top: 40px;" description="oops~获取微信二维码失败">
          <template #extra>
            <NButton :loading="loading" size="small" @click="getLoginWxImage">
              刷新试试
            </NButton>
          </template>
        </NEmpty>
      </div>
    </NCard>
  </NSpin>
</template>

<style>
.modal-content {
min-width: 300px;
padding: 2rem;
}

.close-button {
position: absolute;
top: 0;
right: 0;
font-size: 1.5rem;
background: none;
border: none;
padding: 0.5rem;
cursor: pointer;
}
</style>
