<script setup lang="ts">
import { NCard, NGi, NGrid, NIcon, NNumberAnimation, NTag, useMessage } from 'naive-ui'
import { GithubOutlined } from '@vicons/antd'
import { computed, ref } from 'vue'
import VisiTab from './components/VisiTab.vue'
import {
  adminGetTotalOrderReq,
  adminGetTotalVisitReq,
  querySalerMoney,
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

interface SalerMoney {
  price: number
  settle_price: number
}

const ms = useMessage()
const isProxyBuss = import.meta.env.VITE_GLOB_APP_PROXY === 'true'

// const defalutData: TotalVisitReqData = {
// total_result: { total_visits: '9' },
// hour_result: [{ hour: 16, count: '4' }, { hour: 17, count: '2' }],
// month_result: [{ month: 3, count: '1' }, { month: 5, count: '6' }],
// }

// const defalutOrderData: TotalOrderReqData = {
// total_result: { total_order: 100000, total_money: 132 },
// weak_result: { weak_order: 2008877, weak_money: 345 },
// }

const totalVisitData = ref<TotalVisitReqData>() // reactive(defalutData)
const totalOrderData = ref<TotalOrderReqData>()
const totalSalerMoney = ref<SalerMoney>()

const totalVisitShow = computed(() => {
  if (totalVisitData.value?.total_result?.total_visits)
    return parseInt(totalVisitData.value?.total_result?.total_visits)
  return 0
})

const dayVisitShow = computed(() => {
  if (totalVisitData.value?.hour_result) {
    const result = totalVisitData.value.hour_result.reduce((pre, cur) => {
      return { hour: -1, count: (parseInt(pre.count) + parseInt(cur.count)).toString() }
    }, { hour: -1, count: '0' })
    return parseInt(result.count)
  }
  return 0
})

const totalSaleMoneyShow = computed(() => {
  if (totalOrderData.value?.total_result.total_money)
    return totalOrderData.value.total_result.total_money

  return 0
})

const weakSaleMoneyShow = computed(() => {
  if (totalOrderData.value?.weak_result.weak_money)
    return totalOrderData.value.weak_result.weak_money

  return 0
})

const totalOrderShow = computed(() => {
  if (totalOrderData.value?.total_result.total_order)
    return totalOrderData.value.total_result.total_order

  return 0
})

const weakOrderShow = computed(() => {
  if (totalOrderData.value?.weak_result.weak_order)
    return totalOrderData.value.weak_result.weak_order

  return 0
})

const hasSettledShow = computed(() => {
  if (totalSalerMoney.value?.settle_price)
    return totalSalerMoney.value.settle_price
  return 0
})

const canSettledShow = computed(() => {
  if (totalSalerMoney.value?.price)
    return totalSalerMoney.value.price - hasSettledShow.value

  return 0
})

const hourCharData = computed(() => {
  if (totalVisitData.value?.hour_result && totalVisitData.value?.hour_result.length > 0) {
    const data = totalVisitData.value?.hour_result
    const maxHour = Math.max(...data.map(d => d.hour))
    const defaultData = []

    for (let i = 0; i <= maxHour; i++) {
      const item = { hour: i, count: '0' }
      defaultData.push(item)
    }

    const existingItems: { [key: number]: HourResult } = {}
    data.forEach((d) => {
      existingItems[d.hour] = d
    })

    const result = defaultData.map(d => existingItems[d.hour] || d)

    const hours = result.map(d => d.hour)
    const counts = result.map(d => parseInt(d.count, 10))
    return { xAsix: hours, yAsix: counts }
  }
  return { xAsix: [], yAsix: [] }
})

const monthCharData = computed(() => {
  if (totalVisitData.value?.month_result && totalVisitData.value?.month_result.length > 0) {
    const data = totalVisitData.value?.month_result
    const maxMonth = Math.max(...data.map(d => d.month))
    const defaultData = []

    for (let i = 1; i <= maxMonth; i++) {
      const item = { month: i, count: '0' }
      defaultData.push(item)
    }

    const existingItems: { [key: number]: MonthResult } = {}
    data.forEach((d) => {
      existingItems[d.month] = d
    })

    const result = defaultData.map(d => existingItems[d.month] || d)

    const months = result.map(d => d.month)
    const counts = result.map(d => parseInt(d.count, 10))
    return { xAsix: months, yAsix: counts }
  }
  return { xAsix: [], yAsix: [] }
})

async function getTotalVisitReq() {
  try {
    const { data } = await adminGetTotalVisitReq()
    const result = JSON.parse(data as string)
    totalVisitData.value = result
    // console.log(result)
  }
  catch (error: any) {
    // console.log(error.message)
    ms.error('查询失败，请尝试刷新页面')
  }
}

async function getTotalOrderReq() {
  try {
    const { data } = await adminGetTotalOrderReq()
    const result = JSON.parse(data as string)
    totalOrderData.value = result

    // console.log(result)
  }
  catch (error: any) {
    // console.log(error.message)
    ms.error('查询失败，请尝试刷新页面')
  }
}

async function getSalerMoneyReq() {
  try {
    const { data } = await querySalerMoney('')
    const result = JSON.parse(data as string)
    totalSalerMoney.value = result
  }
  catch {
    ms.error('查询代理商金额失败，请尝试刷新页面')
  }
}
if (isProxyBuss)
  getSalerMoneyReq()

getTotalVisitReq()
getTotalOrderReq()
</script>

<template>
  <div>
    <div style="margin-bottom: 10px;">
      尊贵的代理商您好，申请结算或其它问题请联系微信号: chatgptstu
    </div>
    <NGrid x-gap="12" y-gap="12" :cols="3">
      <NGi>
        <NCard title="访问量" size="small" class="cursor-pointer project-card-item ms:w-1/2 md:w-1/3" hoverable>
          <div class="flex">
            <span>
              <NIcon size="30">
                <GithubOutlined />
              </NIcon>
            </span>
            <span class="text-2xl ml-4">
              <NNumberAnimation show-separator :from="0" :to="dayVisitShow" :active="dayVisitShow > 0" />
            </span>
          </div>

          <template #header-extra>
            <NTag type="success">
              日
            </NTag>
          </template>
          <template #footer>
            <div class="flex justify-between">
              <div class="text-sn">
                总访问量：
              </div>
              <div class="text-sn">
                <!-- <CountTo :startVal="1" :endVal="visits.amount" /> -->
                <NNumberAnimation show-separator :from="0" :to="totalVisitShow" :active="totalVisitShow > 0" />
              </div>
            </div>
          </template>
        </NCard>
      </NGi>
      <NGi>
        <NCard title="销售额" size="small">
          <div class="flex">
            <span>
              <NIcon size="30">
                <GithubOutlined />
              </NIcon>
            </span>
            <span class="text-2xl ml-4">
              <NNumberAnimation show-separator :from="0" :to="weakSaleMoneyShow" :active="weakSaleMoneyShow > 0" />
            </span>
          </div>

          <template #header-extra>
            <NTag type="info">
              周
            </NTag>
          </template>
          <template #footer>
            <div class="flex justify-between">
              <div class="text-sn">
                总销售额：
              </div>
              <div class="text-sn">
                <!-- <CountTo :startVal="1" :endVal="visits.amount" /> -->
                <span>￥</span>
                <NNumberAnimation show-separator :from="0" :to="totalSaleMoneyShow" :active="totalSaleMoneyShow > 0" />
              </div>
            </div>
          </template>
        </NCard>
      </NGi>
      <NGi>
        <NCard title="订单量" size="small">
          <div class="flex">
            <span>
              <NIcon size="30">
                <GithubOutlined />
              </NIcon>
            </span>
            <span class="text-2xl ml-4">
              <NNumberAnimation show-separator :from="0" :to="weakOrderShow" :active="weakOrderShow > 0" />
            </span>
          </div>

          <template #header-extra>
            <NTag type="info">
              周
            </NTag>
          </template>
          <template #footer>
            <div class="flex justify-between">
              <div class="text-sn">
                总订单量：
              </div>
              <div class="text-sn">
                <!-- <CountTo :startVal="1" :endVal="visits.amount" /> -->
                <NNumberAnimation show-separator :from="0" :to="totalOrderShow" :active="totalOrderShow > 0" />
              </div>
            </div>
          </template>
        </NCard>
      </NGi>
      <NGi v-if="isProxyBuss">
        <NCard title="可结算" size="small">
          <div class="flex">
            <span>
              <NIcon size="30">
                <GithubOutlined />
              </NIcon>
            </span>
            <span class="text-2xl ml-4">
              <!-- <NNumberAnimation show-separator :from="0" :to="weakOrderShow" :active="weakOrderShow > 0" /> -->
              {{ canSettledShow }}
            </span>
          </div>

          <template #header-extra>
            <NTag type="error">
              总
            </NTag>
          </template>
          <template #footer>
            <div class="flex justify-between">
              <div class="text-sn">
                已结算：
              </div>
              <div class="text-sn">
                <!-- <CountTo :startVal="1" :endVal="visits.amount" /> -->
                {{ hasSettledShow }}
              </div>
            </div>
          </template>
        </NCard>
      </NGi>
    </NGrid>
    <div class="echart">
      <VisiTab :trend-data="hourCharData" :visit-data="monthCharData" />
    </div>
  </div>
</template>

<style lang="less" scoped>
.workplace {
display: flex;
flex-direction: column;
}

.container {
display: flex;
flex-direction: row;
justify-content: space-between;
}

.row-container {
background-color: white;
width: 20%;
display: flex;
flex-direction: row;
justify-content: left;
padding: 20px;
}

.col-container {
width: 300px;
height: 100px;
background-color: white;
}

.echart {
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
