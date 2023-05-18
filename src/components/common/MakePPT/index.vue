<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  NButton,
  NCard,
  NForm,
  NInput,
  NInputNumber,
  NSpace,
  NSpin,
  useMessage,
} from 'naive-ui'
import { downloadPPTRequest, makePPTRequest } from '@/api'
import {
  SvgIcon,
} from '@/components/common'

const props = defineProps<Props>()

const emit = defineEmits<Emit>()

interface Props {
  visible: boolean
}

interface Emit {
  (e: 'update:visible', visible: boolean): void
}

const showModal = computed({
  get: () => props.visible,
  set: (visible: boolean) => emit('update:visible', visible),
})

const canDownload = ref(false)
const ms = useMessage()
const loading = ref(false)
const topic = ref('')
const pagenum = ref(0)
const downloadPPT = async () => {
  downloadPPTRequest().then((res: any) => {
    const contentDisposition = res.headers['content-disposition']
    let filename = 'myfile.pptx' // 默认文件名
    if (contentDisposition) {
      const files: string[] = contentDisposition.split('filename=')
      if (files.length > 1)
        filename = decodeURIComponent(files[1])
    }
    const blob: any = new Blob([res.data])
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.download = filename
    a.href = url
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
  }).catch((error) => {
    ms.error(error.message ?? '下载失败')
  })
}
const generatePPT = async () => {
  if (topic.value.length <= 0) {
    ms.error('请输入主题')
    return
  }
  if (pagenum.value > 20 || pagenum.value <= 0) {
    ms.error('页数必须在1-20之间')
    return
  }

  try {
    loading.value = true
    const { message } = await makePPTRequest(topic.value, pagenum.value.toString())
    ms.success(message ?? '')
    canDownload.value = true
  }
  catch (error: any) {
    ms.error(error.message ?? '')
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <!-- 自定义模态框 -->
  <div v-if="showModal" class="modal">
    <NSpin :show="loading">
      <NCard>
        <NForm>
          <NSpace vertical>
            <div>
              <label for="topic">主题:</label>
              <NInput id="topic" v-model:value="topic" type="text" placeholder="请输入要生成的主题" />
            </div>
            <div>
              <label for="page">页数:</label>
              <NInputNumber id="page" v-model:value="pagenum" :max="20" :min="0" placeholder="最多20页" />
            </div>
            <NButton type="primary" style="width: 100%;" @click.prevent="generatePPT">
              立即生成
            </NButton>
            <NButton ref="downloadbt" style="width: 100%;" :disabled="!canDownload" @click.prevent="downloadPPT">
              立即下载
            </NButton>
          </NSpace>
        </NForm>
      </NCard>

      <button class="close-button" @click="showModal = false">
        <SvgIcon icon="ic:baseline-close" />
      </button>
    </NSpin>
  </div>
</template>

<style scoped>
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

button[disabled] {
cursor: not-allowed;
background-color: gray;
}
</style>
