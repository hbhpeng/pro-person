<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { defineEmits, ref, unref } from 'vue'
import { NAvatar, NDropdown } from 'naive-ui'
import { SvgIcon } from '@/components/common'
import { useAuthStoreWithout } from '@/store/modules/auth'

defineProps({
  collapsed: Boolean,
})

const emit = defineEmits<Emit>()

const authStore = useAuthStoreWithout()

interface Emit {
  (e: 'update:collapsed', collapsed: boolean): void
}
const router = useRouter()
const route = useRoute()

const avatarOptions = ref([])

avatarOptions.value = [
  {
    label: '个人设置',
    key: 1,
  },
  {
    label: '退出登录',
    key: 2,
  },
]

function doLogout() {
  authStore.removeAdminT()
  router.push({ name: 'Root' })
}

// 刷新页面
const reloadPage = () => {
  router.push({
    path: `/redirect${unref(route).fullPath}`,
  })
}

// 头像下拉菜单
const avatarSelect = (key: any) => {
  switch (key) {
    case 1:
      router.push({ name: 'adminconfig_personal' })
      break
    case 2:
      doLogout()
      break
  }
}
</script>

<template>
  <div class="layout-header">
    <div class="layout-header-left">
      <div
        class="ml-1 layout-header-trigger layout-header-trigger-min"
        @click="() => emit('update:collapsed', !collapsed)"
      >
        <SvgIcon style="width: 40px; height: 40px;" icon="mdi:unfold-more-vertical" />
      </div>

      <div class="mr-1 layout-header-trigger layout-header-trigger-min" @click="reloadPage">
        <SvgIcon style="width: 30px; height: 30px;" icon="ic:outline-refresh" />
      </div>
    </div>

    <div class="layout-header-right">
      <!-- 个人中心 -->
      <div class="layout-header-trigger layout-header-trigger-min">
        <NDropdown trigger="hover" :options="avatarOptions" @select="avatarSelect">
          <div class="avatar">
            <NAvatar round>
              admin
            </NAvatar>
          </div>
        </NDropdown>
      </div>
    </div>
  </div>
</template>

<style scoped>
.layout-header {
display: flex;
flex-direction: row;
justify-content: space-between;
align-items: center;
padding: 0;
height: 64px;
box-shadow: 0 1px 4px #00152914;
transition: all .2s ease-in-out;
width: 100%;
z-index: 11
}

.layout-header-trigger-min {
width: auto;
padding: 0 12px;
}

.layout-header-left {
display: flex;
align-items: center;
}

.layout-header-right {
display: flex;
align-items: center;
margin-right: 20px;
}

.avatar {
display: flex;
align-items: center;
height: 64px;
cursor: pointer;
}
</style>
