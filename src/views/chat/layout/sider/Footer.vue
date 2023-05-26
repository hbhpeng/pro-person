<script setup lang='ts'>
import { defineAsyncComponent, ref } from 'vue'
import { HoverButton, SvgIcon } from '@/components/common'
import { router } from '@/router'

defineProps<Props>()

const emits = defineEmits<Emit>()

const Setting = defineAsyncComponent(() => import('@/components/common/Setting/index.vue'))

interface Emit {
  (e: 'clickPerson'): void
}

interface Props {
  showPerson: boolean
}

const show = ref(false)

const tapPerson = () => {
  emits('clickPerson')
}

const gotoPreview = () => {
  router.push({ name: 'preview' })
}
</script>

<template>
  <footer style="background-color: #f8f8f8;" class="flex items-center min-w-0 p-4 overflow-hidden dark:border-neutral-800">
    <!-- <div class="flex-1 flex-shrink-0 overflow-hidden">
      <UserAvatar />
    </div> -->

    <!--    <HoverButton tooltip="设置" @click="show = true">
      <span class="text-xl text-[#4f555e] dark:text-white">
        <SvgIcon icon="ri:settings-4-line" />
      </span>
    </HoverButton>
    <span style="cursor: pointer;" @click="show = true">{{ $t('setting.setting') }}</span> -->
    <div v-if="showPerson" class="person-container" @click="tapPerson">
      <span style="display: inline-block; border-radius: 15px; width: 30px; height: 30px; overflow: hidden;">
        <img src="/user_avater.png" alt="">
      </span>
      <span style="margin-left: 10px;">个人中心</span>
    </div>
    <HoverButton tooltip="预览" :class="{ preview: !showPerson }" @click="gotoPreview">
      <span class="dark:text-black">
        <SvgIcon icon="fontisto:preview" />
      </span>
    </HoverButton>
    <span style="cursor: pointer;" @click="gotoPreview">预览复制</span>
    <Setting v-if="show" v-model:visible="show" />
  </footer>
</template>

<style scoped>
.person-container {
display: flex;
justify-content: center;
align-items: center;
cursor: pointer;
margin-right: 30px;
}
.preview {
margin-left: -8px;
}
</style>
