<script setup lang='ts'>
import {
  NBadge,
  NButton,
  NCard,
  NDivider,
  NEmpty,
  NGrid,
  NGridItem,
  NSpace,
  NSpin,
  useMessage,
} from 'naive-ui'
import {
  computed,
  ref,
  watch,
} from 'vue'
import {
  reqProductList,
} from '@/api'

interface OrderProductInfo {
  id: number
  name: string
  wordnum: number
  originprice: number
  nowprice: number
  description: string
  reserve: string
  needvip: number
}

const emits = defineEmits < Emit > ()
const ms = useMessage()

interface Emit {
  (e: 'userWantPay', product: any): void
  (e: 'update:visible', visible: boolean): void
}

const loading = ref(false)
const productList = ref < OrderProductInfo[] > ()
const vipList = ref < OrderProductInfo[] > ()
const wordList = ref < OrderProductInfo[] > ()

watch(
  () => productList,
  () => {
    vipList.value = productList.value?.filter((value) => {
      return (value.name === '周会员') || (value.name === '月会员')
|| (value.name === '季会员') || (value.name === '年会员')
    })
    wordList.value = productList.value?.filter((value) => {
      return !((value.name === '周会员') || (value.name === '月会员')
|| (value.name === '季会员') || (value.name === '年会员'))
    })
  }, {
    deep: true,
  },
)

const vipShow = computed(() => {
  if (vipList.value)
    return vipList.value?.length > 0
  return false
})

const wordShow = computed(() => {
  if (wordList.value)
    return wordList.value?.length > 0
  return false
})

async function requestProductList() {
  loading.value = true
  try {
    const {
      data,
    } = await reqProductList()
    productList.value = JSON.parse(data as string) as OrderProductInfo[]
  }
  catch {
    ms.error('获取产品列表失败')
  }
  finally {
    loading.value = false
  }
}

async function payProduct(item: OrderProductInfo) {
  emits('userWantPay', item.id.toString())
}

requestProductList()
</script>

<template>
  <NSpin :show="loading">
    <div style="background-color: white; padding: 10px;">
      <div v-if="vipShow">
        <NDivider>充值会员</NDivider>
        <NGrid cols="1 s:2 m:3 l:3 xl:3 2xl:3" responsive="screen" x-gap="15" y-gap="15">
          <NGridItem v-for="(item, index) of vipList" :key="index">
            <NBadge :value="item.reserve">
              <NCard hoverable embedded>
                <div class="title">
                  {{ item?.name }}
                </div>
                <div>
                  <span class="price">￥{{ item.nowprice }}</span><span
                    v-if="item.originprice > 0"
                    class="old-price"
                  >原价：{{ item.originprice }}</span>
                </div>
                <div class="title">
                  {{ item?.wordnum }}万字
                </div>
                <NDivider style="margin-top: 10px;margin-bottom: 10px;" />
                <NSpace vertical>
                  <div class="des-content">
                    {{ item?.description }}
                  </div>
                  <NButton style="width: 100%;" type="primary" @click="payProduct(item)">
                    确认支付
                  </NButton>
                  <div class="hint-content">
                    目前仅支持使用微信支付
                  </div>
                </NSpace>
              </NCard>
            </NBadge>
          </NGridItem>
        </NGrid>
      </div>

      <div v-if="wordShow">
        <NDivider>充值字数</NDivider>
        <div style="text-align: center;margin-top: -20px;margin-bottom: 10px;">
          tips: 非会员不能充值字数哦
        </div>
        <NGrid cols="1 s:2 m:3 l:3 xl:3 2xl:3" responsive="screen" x-gap="15" y-gap="15">
          <NGridItem v-for="(item, index) of wordList" :key="index">
            <NBadge :value="item.reserve">
              <NCard hoverable embedded>
                <div class="title">
                  {{ item?.name }}
                </div>
                <div>
                  <span class="price">￥{{ item.nowprice }}</span><span
                    v-if="item.originprice > 0"
                    class="old-price"
                  >原价：{{ item.originprice }}</span>
                </div>
                <div class="title">
                  {{ item?.wordnum }}万字
                </div>
                <NDivider style="margin-top: 10px;margin-bottom: 10px;" />
                <NSpace vertical>
                  <div class="des-content">
                    {{ item?.description }}
                  </div>
                  <NButton style="width: 100%;" type="primary" @click="payProduct(item)">
                    确认支付
                  </NButton>
                  <div class="hint-content">
                    目前仅支持使用微信支付
                  </div>
                </NSpace>
              </NCard>
            </NBadge>
          </NGridItem>
        </NGrid>
      </div>
      <NCard v-if="!vipShow && !wordShow" size="huge" :bordered="true">
        <NEmpty size="huge" description="你什么也找不到">
          <template #extra>
            <NButton @click="requestProductList">
              刷新试试
            </NButton>
          </template>
        </NEmpty>
      </NCard>
    </div>
  </NSpin>
</template>

<style scoped>
.price {
font-size: 20px;
}

.old-price {
margin-left: 20px;
text-decoration: line-through;
}

.line-divider {
margin-top: 10px;
margin-bottom: 10px;
}

.des-content {
max-width: 200px;
white-space: pre-wrap;
}

.hint-content {
color: gray;
font-size: 10px;
}

.title {
color: blue;
}
</style>
