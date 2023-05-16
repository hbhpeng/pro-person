<script setup lang='ts'>
import {
  computed,
  ref,
} from 'vue'
import {
  NButton,
  NCard,
  NModal,
  NSpace,
} from 'naive-ui'
const props = defineProps < Props > ()

const emits = defineEmits < Emit > ()

const bodyStyle = ref({
  width: '400px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
})

interface Emit {
  (e: 'createOrder'): void
  (e: 'update:visible', visible: boolean): void
}
interface Props {
  visible: boolean
}
const showModal = computed({
  get: () => props.visible,
  set: (visible: boolean) => emits('update:visible', visible),
})

function closeAndCreateOrder() {
  emits('createOrder')
}
</script>

<template>
  <NModal v-model:show="showModal" class="custom-card" title="支付" size="huge">
    <NCard :style="bodyStyle" title="支付" :bordered="false" size="huge" role="dialog" aria-modal="true">
      <NSpace :style="bodyStyle">
        <h2>0.01</h2>
        <div>微信支付</div>
        <NButton @click="closeAndCreateOrder">
          确认支付
        </NButton>
      </NSpace>
    </NCard>
  </NModal>
</template>

<style>
</style>
