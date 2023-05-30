<script setup lang="ts">
import { ref } from 'vue'
import {
  SvgIcon,
} from '@/components/common'
const emit = defineEmits<Emits>()
const titles = ref([{ title: '热门提问', icon: 'mdi:hot' }])
titles.value.push({ title: '有趣的问题', icon: 'solar:emoji-funny-square-broken' })
titles.value.push({ title: '应用场景', icon: 'tabler:api-app' })

const tips = ref(['一个半小时是几小时呢'])
tips.value.push('我怀孕了，但是男朋友想做亲子鉴定，我该怎么办')
tips.value.push('单身很久的人怎么找到女朋友？')
tips.value.push('如果有一天，我要利用你帮我赚人生中第一桶金，你会不会怪我？')
tips.value.push('给我个买股票的方案')
tips.value.push('程序员摆摊卖炒面挣钱吗？')
tips.value.push('离职信怎么写呢？')
tips.value.push('选择留在大城市工作，还是回家发展？')
tips.value.push('请预测中国2023年汽车市场的趋势')

interface Emits {
  (e: 'clickTips', content: string): void
}

const tapTips = (item: string) => {
  emit('clickTips', item)
}
</script>

<template>
  <div class="content_body">
    <div class="chat-title">
      智能Chat AI对话中文版
    </div>
    <div class="tips-content">
      <div v-for="(item, index) in titles" :key="index" class="tip_title">
        <SvgIcon class="text-2xl" :icon="item.icon" />
        <div class="tititle_label">
          {{ item.title }}
        </div>
      </div>
      <div v-for="(item, index) in tips" :key="index" class="tips-item">
        <div class="tips-item-content" @click="tapTips(item)">
          {{ item }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.content_body {
padding: 15px;
}
.chat-title {
display: flex;
justify-content: center;
color: #333;
font-size: 34px;
font-weight: 700;
font-family: Avenir,Helvetica,Arial,sans-serif;
}
.tips-content {
display: flex;
flex-wrap: wrap;
padding-top: 5vh;
color: #666;
}
.tip_title {
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
flex-grow: 1;
width: 33.3%;
padding-bottom: 24px;
text-align: center;
}
.tititle_label {
font-size: 18px;
line-height: 48px;
}
.tips-item {
display: flex;
align-items: stretch;
flex-grow: 1;
width: 33.3%;
padding: 0 18px 10px;
}
.tips-item-content {
display: flex;
align-items: center;
justify-content: center;
background-color: #f7f7f7;
border-radius: 3px;
/* height: 38px; */
line-height: 28px;
text-align: center;
padding: 0 12px;
/* text-overflow: ellipsis; */
overflow: hidden;
white-space: pre-line;
font-size: 14px;
cursor: pointer;
width: 100%;
}
</style>
