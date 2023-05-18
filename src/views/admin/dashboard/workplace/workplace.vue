<script setup lang="ts">
import { NCard, NGi, NGrid, NIcon } from 'naive-ui'
import { GithubOutlined } from '@vicons/antd'
import { reactive } from 'vue'
import VisiTab from './components/VisiTab.vue'
import {
  adminGetTotalOrderReq,
  adminGetTotalVisitReq,
} from '@/api'
interface HourResult {
  hour: number
  count: string
}
interface MonthResult {
  month: number
  count: string
}
interface TotalVisitReqData {
  total_result: { total_visits: string }
  hour_result: Array<HourResult>
  month_result: Array<MonthResult>
}

interface TotalResut {
  total_order: number
  total_money: number
}
interface WeekResut {
  weak_order: number
  weak_money: number
}
interface TotalOrderReqData {
  total_result: TotalResut
  weak_result: WeekResut
}

const defalutData: TotalVisitReqData = {
  total_result: { total_visits: '9' },
  hour_result: [{ hour: 16, count: '4' }, { hour: 17, count: '2' }],
  month_result: [{ month: 3, count: '1' }, { month: 5, count: '6' }],
}

const defalutOrderData: TotalOrderReqData = {
  total_result: { total_order: 0, total_money: 132 },
  weak_result: { weak_order: 0, weak_money: 345 },
}

let totalVisitData: TotalVisitReqData = reactive(defalutData)
let totalOrderData: TotalOrderReqData = reactive(defalutOrderData)

async function getTotalVisitReq() {
  try {
    const { data } = await adminGetTotalVisitReq()
    const result = JSON.parse(data as string)
    totalVisitData = reactive(result)
    // eslint-disable-next-line no-console
    console.log(result)
  }
  catch (error: any) {
    // eslint-disable-next-line no-console
    console.log(error.message)
  }
}

async function getTotalOrderReq() {
  try {
    const { data } = await adminGetTotalOrderReq()
    const result = JSON.parse(data as string)
    totalOrderData = reactive(result)
    // eslint-disable-next-line no-console
    console.log(result)
  }
  catch (error: any) {
    // eslint-disable-next-line no-console
    console.log(error.message)
  }
}
getTotalVisitReq()
getTotalOrderReq()
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
          <span class="text-lg ml-4">{{ totalVisitData?.total_result?.total_visits }}</span>
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
          <span class="text-lg ml-4">{{ totalOrderData?.total_result?.total_order }}</span>
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
          <span class="text-lg ml-4">{{ totalOrderData?.weak_result?.weak_money }}</span>
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
  <div class="echart">
    <VisiTab />
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
