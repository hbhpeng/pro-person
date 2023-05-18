<script setup lang='ts'>
import { NButton, NNumberAnimation, NSpace, NSpin, NTooltip, useMessage } from 'naive-ui'
import { computed, ref, watch } from 'vue'
import { useAuthStoreWithout } from '@/store/modules/auth'
import {
  getSingleUserInfo,
} from '@/api'
import {
  SvgIcon,
} from '@/components/common'
import { isVip } from '@/utils/is'

const props = defineProps<Props>()

const emit = defineEmits<Emit>()

const authStore = useAuthStoreWithout()
const numberAnimationInstRef = ref<typeof NNumberAnimation | null>(null)

interface Props {
  visible: boolean
}

interface Emit {
  (e: 'update:visible', visible: boolean): void
  (e: 'becomeVip'): void
}

const showModal = computed({
  get: () => props.visible,
  set: (visible: boolean) => emit('update:visible', visible),
})
const username = ref('')
const totalChars = ref(0)
const usedChars = ref(0.0)
const vipendday = ref('')
const vip = ref(false)
const vipStyle = ref('color: red;')
const ms = useMessage()
const loading = ref(false)
const leftChars = computed(() => {
  let leftValue = totalChars.value - usedChars.value
  if (leftValue < 0)
    leftValue = 0
  return parseInt((leftValue * 10000).toString())
})

const requestUserInfo = () => {
  try {
    loading.value = true
    getSingleUserInfo().then((res) => {
      const userInfo = JSON.parse(res.data as any)
      username.value = userInfo.username as string
      totalChars.value = userInfo.usagecount as number
      usedChars.value = userInfo.usecount as number
      vipendday.value = userInfo.vipendday as string
      vip.value = isVip(vipendday.value)
      if (leftChars.value > 0)
        setTimeout(numberAnimationInstRef.value?.play, 100)
      // numberAnimationInstRef.value?.play()

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

const becomeVip = () => {
  emit('becomeVip')
}
</script>

<template>
  <!-- 自定义模态框 -->
  <div v-if="showModal" class="modal" style="text-align: center;">
    <NSpin :show="loading">
      <div class="modal-content">
        <button class="close-button" @click="showModal = false">
          <SvgIcon icon="ic:baseline-close" />
        </button>
        <div class="user-img-container">
          <SvgIcon style="width: 40px; height: 40px; color: red;" icon="arcticons:cat-avatar-generator" />
        </div>
        <div class="name-row-content">
          <span>{{ username }}</span>
          <SvgIcon v-if="vip" :style="vipStyle" icon="ri:vip-line" />
        </div>
        <NSpace style="margin-top: 10px;" vertical>
          <div v-if="vip" class="row-content">
            <span>会员到期日：</span>
            <span>{{ vipendday.substr(0, 10) }}</span>
          </div>
          <NTooltip v-else>
            <template #trigger>
              <NButton tag="div" class="" @click.prevent="becomeVip">
                立即升级会员
              </NButton>
            </template>
            你必然一身才华，才会被这么多人惦记
          </NTooltip>
          <div class="row-content">
            <span>总字数：</span>
            <span>{{ totalChars.toFixed(4).toString() }}万</span>
          </div>

          <div class="row-content">
            <span>可用字数：</span>
            <NNumberAnimation
              ref="numberAnimationInstRef"
              show-separator
              :from="0"
              :to="leftChars"
              :active="false"
            />
          </div>
          <!-- <p>可用字数：{{ parseInt(((totalChars - usedChars) * 10000).toString()).toString() }}</p> -->
          <div class="row-content">
            <span>已用字数：</span>
            <span>{{ usedChars.toFixed(4).toString() }}万</span>
          </div>
        </NSpace>
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

.user-img-container {
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
}

.row-content {
display: flex;
justify-content: space-between;
}

.name-row-content {
display: flex;
justify-content: center;
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
color: white;
}
</style>
