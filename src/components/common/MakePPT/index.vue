<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  NSpin,
  useMessage,
} from 'naive-ui'
import { downloadPPTRequest, makePPTRequest } from '@/api'

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
const pagenum = ref('')
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
  if (parseInt(pagenum.value) > 20 || parseInt(pagenum.value) <= 0) {
    ms.error('页数必须在1-20之间')
    return
  }

  try {
    loading.value = true
    const { message } = await makePPTRequest(topic.value, pagenum.value)
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
      <div class="modal-content">
        <button class="close-button" @click="showModal = false">
          X
        </button>
        <form>
          <label for="topic">主题:</label>
          <input id="topic" v-model="topic" type="text" placeholder="请输入要生成的主题" class="input-content">

          <label for="page">页数:</label>
          <input id="page" v-model="pagenum" type="number" placeholder="最多20页" class="input-content">

          <button type="submit" @click.prevent="generatePPT">
            立即生成
          </button>
          <button ref="downloadbt" type="submit" :disabled="!canDownload" @click.prevent="downloadPPT">
            立即下载
          </button>
        </form>
      </div>
    </NSpin>
  </div>
</template>

<style>
.input-content {
border: 2px solid gray;
padding: 0.3rem;
border-radius: 5px;
}

button[disabled] {
cursor: not-allowed;
background-color: gray;
}
</style>
