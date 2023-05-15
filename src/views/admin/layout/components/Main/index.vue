<script lang="ts">
import { defineComponent, ref } from 'vue'

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
    const pageAnimateType = ref('zoom-fade')
    return {
      pageAnimateType,
    }
  },
})
</script>

<template>
  <RouterView>
    <template #default="{ Component, route }">
      <transition :name="pageAnimateType" mode="out-in" appear>
        <component :is="Component" :key="route.fullPath" />
      </transition>
    </template>
  </RouterView>
</template>

<style scoped>
.zoom-fade-enter-active,
.zoom-fade-leave-active {
transition: transform 0.2s, opacity 0.3s ease-out;
}

.zoom-fade-enter-from {
opacity: 0;
transform: scale(0.92);
}

.zoom-fade-leave-to {
opacity: 0;
transform: scale(1.06);
}
</style>
