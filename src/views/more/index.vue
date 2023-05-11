<script setup lang="ts">
import { NCard, NGrid, NGridItem, NTab, NTabs } from 'naive-ui'
import { ref } from 'vue'
import { SvgIcon } from '@/components/common'
import { router } from '@/router'

// const responsiveCols = ref(3)
const categories = ref([
  '分类1',
  '分类2',
  '分类3',
])
const data = ref([
  [
    { title: '数据1', image: '/src/assets/avatar.png' },
    { title: '数据2', image: 'image2.png' },
    { title: '数据3', image: 'image3.png' },
  ],
  [
    { title: '数据4', image: 'image4.png' },
    { title: '数据5', image: 'image5.png' },
    { title: '数据6', image: 'image6.png' },
  ],
  [
    { title: '数据7', image: 'image7.png' },
    { title: '数据8', image: 'image8.png' },
    { title: '数据9', image: 'image9.png' },
  ],
])
const currentCategory = ref('分类1')
const currentData = ref([
  { title: '数据1', image: 'image1.png' },
  { title: '数据2', image: 'image2.png' },
  { title: '数据3', image: 'image3.png' },
])

function handleTabClick(category: string) {
  const index = categories.value.indexOf(category)
  currentCategory.value = category
  currentData.value = data.value[index]
}

function handleCardClick(item: any) {
  router.push({ name: 'more.chart' })
}
</script>

<template>
  <div class="category-nav">
    <NTabs
      v-model="currentCategory" type="line" animated justify-content="space-around"
      :on-update-value="handleTabClick"
    >
      <NTab v-for="(category, index) in categories" :key="index" :name="category" />
    </NTabs>
  </div>
  <div class="category-list">
    <NGrid :cols="5" x-gap="20px" y-gap="20px" responsive="screen">
      <NGridItem v-for="(item, index) in currentData" :key="index">
        <NCard
          :content-style="{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }"
          @click="handleCardClick(item)"
        >
          <SvgIcon icon="ri:bubble-chart-fill" class="mr-2 text-3xl" />
          <div class="card-title">
            {{ item.title }}
          </div>
        </NCard>
      </NGridItem>
    </NGrid>
  </div>
</template>

<style>
</style>
