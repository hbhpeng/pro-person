<script setup lang='ts'>
import { defineAsyncComponent, ref } from 'vue'
import { HoverButton, SvgIcon } from '@/components/common'
import { router } from '@/router'

const Setting = defineAsyncComponent(() => import('@/components/common/Setting/index.vue'))

const show = ref(false)

const gotoPreview = () => {
  router.push({ name: 'preview' })
}
</script>

<template>
  <footer class="flex items-center min-w-0 p-4 overflow-hidden border-t dark:border-neutral-800">
    <!-- <div class="flex-1 flex-shrink-0 overflow-hidden">
      <UserAvatar />
    </div> -->

    <HoverButton tooltip="设置" @click="show = true">
      <span class="text-xl text-[#4f555e] dark:text-white">
        <SvgIcon icon="ri:settings-4-line" />
      </span>
    </HoverButton>
    <span style="cursor: pointer;" @click="show = true">{{ $t('setting.setting') }}</span>
    <HoverButton tooltip="预览" style="margin-left: 15px;" @click="gotoPreview">
      <span class="text-xl text-[#4f555e] dark:text-white">
        <SvgIcon icon="fontisto:preview" />
      </span>
    </HoverButton>
    <span style="cursor: pointer;" @click="gotoPreview">预览复制</span>
    <Setting v-if="show" v-model:visible="show" />
  </footer>
</template>
