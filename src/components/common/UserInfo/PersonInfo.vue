<script setup lang='ts'>
import { NSpin, useMessage } from 'naive-ui'
import { computed, ref, watch } from 'vue'
import { useAuthStoreWithout } from '@/store/modules/auth'
import {
  getSingleUserInfo,
} from '@/api'

const props = defineProps<Props>()

const emit = defineEmits<Emit>()

const authStore = useAuthStoreWithout()

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
const username = ref('')
const totalChars = ref(0)
const usedChars = ref(0.0)
const ms = useMessage()
const loading = ref(false)

const requestUserInfo = () => {
  try {
    loading.value = true
    getSingleUserInfo().then((res) => {
      const userInfo = JSON.parse(res.data as any)
      username.value = userInfo.username as string
      totalChars.value = userInfo.usagecount as number
      usedChars.value = userInfo.usecount as number
      ms.success(res.message ?? '')
      loading.value = false
    }).catch((reason: any) => {
      ms.success(reason.message ?? '')
      loading.value = false
    })
  }
  catch (error: any) {
    ms.error(error.message ?? '')
    loading.value = false
  }
}

watch(
  () => showModal.value,
  (value) => {
    if (value)
      setTimeout(requestUserInfo, 100)
  },
  { deep: true },
)

const loginOut = () => {
  showModal.value = false
  authStore.$state.userToken = ''
  authStore.removeUserT()
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
        <h2>{{ username }} 的详细信息</h2>
        <p>总字数：{{ totalChars }}万</p>
        <p>可用字数：{{ (totalChars - usedChars) * 10000 }}</p>
        <p>已用字数：{{ usedChars }}万</p>
        <button class="person-info" type="submit" @click.prevent="loginOut">
          退出登录
        </button>
      </div>
    </NSpin>
  </div>
</template>

<style>
.modal {
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
background-color: rgba(0, 0, 0, 0.4);
display: flex;
justify-content: center;
align-items: center;
z-index: 1000;
}

.modal-content {
background-color: white;
padding: 2rem;
border-radius: 10px;
box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.5);
position: relative;
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

button {
margin-top: 1rem;
}

button[type='submit'].person-info {
width: 100%;
margin-top: 20px;
padding: 5px;
background-color: #6AA1E7;
border-radius: 5px;
margin-bottom: 5px;
}
</style>
