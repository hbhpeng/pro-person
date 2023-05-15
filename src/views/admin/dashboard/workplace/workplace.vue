<script setup lang="ts">
import { NCol, NIcon, NRow, NStatistic } from 'naive-ui'
import { IosBulb, MdSave } from '@vicons/ionicons4'
import VisiTab from './components/VisiTab.vue'

// const statisticData = [
//   {
//     title: '新增用户',
//     value: '99',
//     suffix: '100',
//   },
//   {
//     title: '新增用户',
//     value: '99',
//     suffix: '100',
//   },
//   {
//     title: '新增用户',
//     value: '99',
//     suffix: '100',
//   },
// ]
</script>

<template>
  <div class="workplace">
    <div class="container">
      <NRow class="row-container">
        <NCol :span="12">
          <NStatistic label="统计数据" :value="99">
            <template #prefix>
              <NIcon>
                <MdSave />
              </NIcon>
            </template>
            <template #suffix>
              / 100
            </template>
          </NStatistic>
        </NCol>
      </NRow>
      <NRow class="row-container">
        <NCol :span="12">
          <NStatistic label="统计数据" :value="99">
            <template #prefix>
              <NIcon>
                <IosBulb />
              </NIcon>
            </template>
            <template #suffix>
              / 100
            </template>
          </NStatistic>
        </NCol>
      </NRow>
      <NRow class="row-container">
        <NCol :span="12">
          <NStatistic label="统计数据" :value="99">
            <template #prefix>
              <NIcon>
                <MdSave />
              </NIcon>
            </template>
            <template #suffix>
              / 100
            </template>
          </NStatistic>
        </NCol>
      </NRow>
    </div>
    <div class="echart">
      <VisiTab />
    </div>
  </div>
</template>

<style lang="less" scoped>
  .workplace{
    display: flex;
    flex-direction: column;
  }
  .container{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  .row-container{
    background-color: white;
     width: 30%;
    display: flex;
    flex-direction: row;
    justify-content: left;
    padding:20px;
  }
  .col-container{
    width: 300px;
    height: 100px;
    background-color: white;
  }
  .echart{
    background-color: white;
  }
</style>
