<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/store'

const chart_url = ref('')
chart_url.value = `chart.html?chartauth=${useAuthStore().userToken}`
</script>

<template>
  <iframe :src="chart_url" frameborder="0" style="width: 100%;height: 100%;" />
</template>
