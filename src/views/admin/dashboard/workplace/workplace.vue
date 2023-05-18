<script setup lang="ts">
import { NCard, NGi, NGrid, NIcon } from 'naive-ui'
import { GithubOutlined } from '@vicons/antd'
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
  <NGrid x-gap="12" :cols="4">
    <NGi>
      <NCard
        title="总订单量"
        size="small"
        class="cursor-pointer project-card-item ms:w-1/2 md:w-1/3"
        hoverable
      >
        <div class="flex">
          <span>
            <NIcon size="30">
              <GithubOutlined />
            </NIcon>
          </span>
          <span class="text-lg ml-4">14243</span>
        </div>
      </NCard>
    </NGi>
    <NGi>
      <NCard
        title="总金额"
        size="small"
      >
        <div class="flex">
          <span>
            <NIcon size="30">
              <GithubOutlined />
            </NIcon>
          </span>
          <span class="text-lg ml-4">4453</span>
        </div>
      </NCard>
    </NGi>
    <NGi>
      <NCard
        title="周订单量"
        size="small"
      >
        <div class="flex">
          <span>
            <NIcon size="30">
              <GithubOutlined />
            </NIcon>
          </span>
          <span class="text-lg ml-4">565565</span>
        </div>
      </NCard>
    </NGi>
    <NGi>
      <NCard
        title="周金额"
        size="small"
      >
        <div class="flex">
          <span>
            <NIcon size="30">
              <GithubOutlined />
            </NIcon>
          </span>
          <span class="text-lg ml-4">345435</span>
        </div>
      </NCard>
    </NGi>
  </NGrid>
  <!-- <div class="workplace">
    <div class="container">
      <NRow class="row-container">
        <NCol :span="12">
          <NStatistic label="统计数据" :value="99">
            <template #prefix>
              <SvgIcon icon="fontisto:preview" />
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
              <SvgIcon icon="fontisto:preview" />
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
              <SvgIcon icon="fontisto:preview" />
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
              <SvgIcon icon="fontisto:preview" />
            </template>
            <template #suffix>
              / 100
            </template>
          </NStatistic>
        </NCol>
      </NRow>
    </div> -->
  <div class="echart">
    <VisiTab />
  </div>
  <!-- </div> -->
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
     width: 20%;
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

  .light-green {
  height: 108px;
  background-color: rgba(0, 128, 0, 0.12);
}
.green {
  height: 108px;
  background-color: rgba(0, 128, 0, 0.24);
}
</style>
