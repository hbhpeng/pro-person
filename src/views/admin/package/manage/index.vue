<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { NAutoComplete, NButton, NCard, NForm, NFormItem, NIcon, NInput, NInputNumber, NModal, NSpace, NSpin, NSwitch, useLoadingBar, useMessage } from 'naive-ui'
import { PlusOutlined } from '@vicons/antd'
import { type FormRules } from 'naive-ui'
import NewTable from './NewTable.vue'
import {
  reqAddProduct,
  reqDeleteProduct,
  reqProductList,
} from '@/api'
// import { http } from '@/utils/http/axios'

const message = useMessage()
const loadingbar = useLoadingBar()

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

const showModal = ref(false)
const formBtnLoading = ref(false)
const formRef: any = ref(null)
const loading = ref(false)

const formParams = reactive({
  name: '',
  wordnum: 0,
  originprice: 0,
  nowprice: 0,
  description: '',
  needvip: 0,
  reserve: '',
})
const rules: FormRules = {
  name: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入套餐名称',
  },
  wordnum: {
    type: 'number',
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入字数',
  },
  originprice: {
    type: 'number',
    required: false,
    trigger: ['blur', 'input'],
    message: '可以不输入的',
  },
  nowprice: {
    type: 'number',
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入价格',
  },
  description: {
    required: true,
    trigger: ['blur', 'input'],
    message: '给点描述吧',
  },
  reserve: {
    required: false,
    trigger: ['blur', 'input'],
    message: '可以不输入',
  },
}

interface VipOption {
  name: string
  long: number // 1: 7天 2: 1个月 3: 1个季度 4: 1年
}

const productlist = ref<OrderProductInfo[]>([])
const productlistShow = computed(() => {
  return productlist.value.map((item) => {
    return { ...item, needStr: item.needvip > 0 ? '需要' : '不需要' }
  })
})

const getVipOption = (name: string, long: number) => {
  return { name, long }
}

const packageVipOptions: VipOption[] = [getVipOption('周会员', 1), getVipOption('月会员', 2), getVipOption('季会员', 3), getVipOption('年会员', 4)]

const nameOptions = computed(() => {
  const result = packageVipOptions.filter((value) => {
    return value.name.startsWith(formParams.name)
  })
  return result.map((value) => {
    return {
      label: value.name,
      value: value.name,
    }
  })
})

const nameGetShow = (value: string) => {
  return true
}

async function gerProductList() {
  try {
    loadingbar.start()
    const { data } = await reqProductList()
    productlist.value = JSON.parse(data as string) as OrderProductInfo[]
    loadingbar.finish()
  }
  catch (error: any) {
    loadingbar.error()
    message.error(error.message)
  }
}

async function deleteItem(item: any) {
  try {
    loadingbar.start()
    loading.value = true
    await reqDeleteProduct(item)
    productlist.value = productlist.value.filter((value) => {
      return item.id !== value.id
    })
    message.success('删除成功')
    loadingbar.finish()
  }
  catch (error: any) {
    loadingbar.error()
    message.error(error.message)
  }
  finally {
    loading.value = false
  }
}

function checkNeedVip() {
  const index = packageVipOptions.findIndex((value) => {
    return value.name === formParams.name
  })
  if (index > -1)
    formParams.needvip = 0

  else
    formParams.needvip = 1
}

function confirmForm(e: { preventDefault: () => void }) {
  e.preventDefault()
  formRef.value.validate(async (errors: any) => {
    if (errors)
      return

    formBtnLoading.value = true
    try {
      const { message: pid } = await reqAddProduct(formParams)
      const id = parseInt(pid as string)
      productlist.value.unshift({ ...formParams, id })
      formParams.name = ''
      formParams.wordnum = 0
      formParams.originprice = 0
      formParams.nowprice = 0
      formParams.description = ''
      formParams.needvip = 0
      formParams.reserve = ''
      showModal.value = false
      message.success('添加成功')
    }
    catch (error: any) {
      message.error(error.message)
    }
    finally {
      formBtnLoading.value = false
    }
  })
}
gerProductList()
</script>

<template>
  <NCard :bordered="false" class="proCard">
    <NSpace vertical>
      <NButton type="primary" @click="showModal = true">
        <template #icon>
          <NIcon>
            <PlusOutlined />
          </NIcon>
        </template>
        新建套餐
      </NButton>
      <NModal v-model:show="showModal" :show-icon="false" preset="dialog" title="新建套餐">
        <NForm ref="formRef" :model="formParams" :rules="rules" label-placement="left" :label-width="80" class="py-4">
          <NFormItem label="套餐名称" path="name">
            <NAutoComplete
              v-model:value="formParams.name" :options="nameOptions" :get-show="nameGetShow"
              placeholder="套餐名称" @blur="checkNeedVip"
            />
          </NFormItem>
          <NFormItem label="字数" path="wordnum">
            <NInputNumber v-model:value="formParams.wordnum" placeholder="字数" style="width: 100%;">
              <template #suffix>
                万
              </template>
            </NInputNumber>
          </NFormItem>
          <NFormItem label="原价" path="originprice" type="number">
            <NInputNumber v-model:value="formParams.originprice" placeholder="原价" style="width: 100%;" />
          </NFormItem>
          <NFormItem label="现价" path="nowprice" type="number">
            <NInputNumber v-model:value="formParams.nowprice" placeholder="现价" style="width: 100%;">
              <template #suffix>
                元
              </template>
            </NInputNumber>
          </NFormItem>
          <NFormItem label="描述" path="description">
            <NInput v-model:value="formParams.description" type="textarea" placeholder="描述" />
          </NFormItem>
          <NFormItem label="会员制">
            <NSwitch v-model:value="formParams.needvip" :unchecked-value="0" :checked-value="1">
              <template #checked>
                此套餐需先开通会员
              </template>
              <template #unchecked>
                此套餐无需开通会员
              </template>
            </NSwitch>
          </NFormItem>
          <NFormItem label="推荐" path="reserve">
            <NInput v-model:value="formParams.reserve" type="text" placeholder="会显示在卡片右上角" />
          </NFormItem>
        </NForm>

        <template #action>
          <NSpace>
            <NButton @click="() => (showModal = false)">
              取消
            </NButton>
            <NButton type="info" :loading="formBtnLoading" @click="confirmForm">
              确定
            </NButton>
          </NSpace>
        </template>
      </NModal>
      <NSpin :show="loading">
        <NewTable :pro-list="productlistShow" @delete-item="deleteItem" />
      </NSpin>
    </NSpace>
  </NCard>
</template>
