<script setup lang="ts">
import { ref } from 'vue'
import { NLayout, NLayoutSider, NMenu, NSpace } from 'naive-ui'
import MenuCofig from './config'

const inverted = ref(false)
const menuOptions = MenuCofig
</script>

<template>
  <NSpace vertical>
    <!-- <NSpace> <NSwitch v-model:value="inverted" />inverted</NSpace> -->
    <NLayout has-sider position="absolute">
      <NLayoutSider
        bordered
        collapse-mode="width"
        :collapsed-width="64"
        :width="240"
        show-trigger
        :inverted="inverted"
      >
        <NMenu
          :inverted="inverted"
          :collapsed-width="64"
          :collapsed-icon-size="22"
          :options="menuOptions"
        />
      </NLayoutSider>
      <NLayout>
        <span>内容</span>
      </NLayout>
    </NLayout>
  </NSpace>
</template>
