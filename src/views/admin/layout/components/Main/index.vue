<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MainView',
  components: {},
  props: {
    notNeedKey: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
  },
})
</script>

<template>
  <RouterView>
    <template #default="{ Component, route }">
      <transition name="zoom-fade" mode="out-in" appear>
        <component :is="Component" :key="route.fullPath" />
      </transition>
    </template>
  </RouterView>
</template>

<style lang="less" scoped></style>
