<script setup lang="ts">
import { reactive, ref } from 'vue'
import { NAutoComplete, NButton, NCard, NForm, NFormItem, NIcon, NInput, NInputNumber, NModal, NSpace, NSpin, NSwitch, useLoadingBar, useMessage } from 'naive-ui'
import { PlusOutlined } from '@vicons/antd'
import { type FormRules } from 'naive-ui'
import ProxyUserList from './ProxyUserList.vue'
import {
  addSalerProxy,
  queryProxylist,
  querySalerAllMoney,
  querySalerMoney,
  settleSalerAllMoney,
} from '@/api'

interface SalerInfo {
  id: number
  nameid: string
  nickname: string
  lastlevel: string
  baseurl: string
  settled: number
  isblack: number
}

const isProxyBuss = import.meta.env.VITE_GLOB_APP_PROXY === 'true'

const message = useMessage()
const loadingbar = useLoadingBar()

const showModal = ref(false)
const showInfo = ref(false)
const formBtnLoading = ref(false)
const formRef: any = ref(null)
const loading = ref(false)
const settleSalerId = ref('')

let formParams = reactive({
  id: -1,
  nickname: '',
  nameid: '',
  lastlevel: '1',
  baseurl: '',
  settled: 0,
  isblack: 0,
})

const topMoney = ref({
  saler_price: 0,
  proxy_price: 0,
  settle_price: 0,
})

const salerMoney = ref({
  price: 0,
  settle_price: 0,
})

const rules: FormRules = {
  nickname: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入代理商名称',
  },
  nameid: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入代理商编码',
  },
  lastlevel: {
    required: true,
    trigger: ['blur', 'input'],
    message: '邀请码',
  },
  baseurl: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入代理商网址',
  },
  settled: {
    type: 'number',
    required: false,
    trigger: ['blur', 'input'],
    message: '已结算金额直接写0就好',
  },
  isblack: {
    type: 'number',
    required: false,
    trigger: ['blur', 'input'],
    message: '可以不输入',
  },
}

const proxylistShow = ref<SalerInfo[]>([])

const requestEditSaler = async (item: SalerInfo) => {
  try {
    await addSalerProxy(item)
    message.success('修改成功')
  }
  catch (error: any) {
    message.error(error.message)
  }
  finally {
    formBtnLoading.value = false
    loading.value = false
  }
}

const editItem = (item: SalerInfo) => {
  // console.log(item)
  showModal.value = true
  formParams = reactive(item)
}

const blackItem = (item: SalerInfo) => {
  item.isblack = 1
  loading.value = true
  requestEditSaler(item)
}

const showItem = async (item: SalerInfo) => {
  settleSalerId.value = ''
  try {
    loading.value = true
    if (isProxyBuss) {
      const { data } = await querySalerMoney(item.nameid)
      salerMoney.value = JSON.parse(data as string)
    }
    else {
      const { data } = await querySalerAllMoney(item.nameid)
      topMoney.value = JSON.parse(data as string)
    }
    settleSalerId.value = item.nameid
    showInfo.value = true
  }
  catch (error: any) {
    message.error(error.message)
  }
  finally {
    loading.value = false
  }
}

function confirmForm(e: { preventDefault: () => void }) {
  e.preventDefault()
  formRef.value.validate(async (errors: any) => {
    if (errors)
      return

    formBtnLoading.value = true
    try {
      const { message: pid } = await addSalerProxy(formParams)
      const id = parseInt(pid as string)
      if (formParams.id < 0)
        proxylistShow.value.unshift({ ...formParams, id })

      formParams = reactive({
        id: -1,
        nickname: '',
        nameid: '',
        lastlevel: '1',
        baseurl: '',
        settled: 0,
        isblack: 0,
      })
      showModal.value = false
      message.success('操作成功')
    }
    catch (error: any) {
      message.error(error.message)
    }
    finally {
      formBtnLoading.value = false
    }
  })
}

const settleSaler = async () => {
  if (!settleSalerId.value) {
    message.warning('请先查询代理商额度，再进行结算')
    return
  }
  try {
    loading.value = true
    await settleSalerAllMoney(settleSalerId.value)
    message.success('结算成功')
  }
  catch (error: any) {
    message.error(error.message)
  }
  finally {
    loading.value = false
  }
}

async function gerSalersList() {
  try {
    loadingbar.start()
    const { data } = await queryProxylist()
    proxylistShow.value = JSON.parse(data as string) as SalerInfo[]
    loadingbar.finish()
  }
  catch (error: any) {
    loadingbar.error()
    message.error(error.message)
  }
}
gerSalersList()
</script>

<template>
  <div>
    <NCard :bordered="false" class="proCard">
      <NSpace vertical>
        <NButton v-if="!isProxyBuss" type="primary" @click="showModal = true">
          <template #icon>
            <NIcon>
              <PlusOutlined />
            </NIcon>
          </template>
          新增代理商
        </NButton>
        <NModal v-model:show="showInfo" preset="dialog" title="代理商详情">
          <NSpin :show="loading">
            <NSpace vertical>
              <div>
                <span>总销售额:</span><span>{{ isProxyBuss ? salerMoney : topMoney.saler_price }}</span>
              </div>
              <div v-if="!isProxyBuss">
                <span>次级额度:</span><span>{{ topMoney.proxy_price }}</span>
              </div>
              <div>
                <span>已结算额:</span><span>{{ isProxyBuss ? salerMoney.settle_price : topMoney.settle_price }}</span>
              </div>
              <NButton v-if="!isProxyBuss" type="primary" @click="settleSaler">
                结算
              </NButton>
            </NSpace>
          </NSpin>
        </NModal>
        <NModal v-if="!isProxyBuss" v-model:show="showModal" :show-icon="false" preset="dialog" title="新增代理商">
          <NForm ref="formRef" :model="formParams" :rules="rules" label-placement="left" :label-width="80" class="py-4">
            <NFormItem label="代理商名称" path="nickname">
              <NAutoComplete v-model:value="formParams.nickname" placeholder="代理商名称" />
            </NFormItem>
            <NFormItem label="编码" path="nameid">
              <NInput v-model:value="formParams.nameid" placeholder="编码2-5位" />
            </NFormItem>
            <NFormItem label="邀请码" path="lastlevel">
              <NInput v-model:value="formParams.lastlevel" placeholder="编码2-5位,没有的话填1就好" />
            </NFormItem>
            <NFormItem label="网站地址" path="baseurl">
              <NInput v-model:value="formParams.baseurl" placeholder="根地址,最后不要带/" />
            </NFormItem>
            <NFormItem label="已结算金额" path="settled" type="number">
              <NInputNumber v-model:value="formParams.settled" placeholder="新增默认0就好" style="width: 100%;" />
            </NFormItem>
            <NFormItem label="是否列入黑名单" path="isblack">
              <NSwitch v-model:value="formParams.isblack" :unchecked-value="0" :checked-value="1">
                <template #checked>
                  小黑屋
                </template>
                <template #unchecked>
                  小白屋
                </template>
              </NSwitch>
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
          <ProxyUserList
            :pro-list="proxylistShow" @edit-item="editItem" @black-item="blackItem"
            @show-item="showItem"
          />
        </NSpin>
      </NSpace>
    </NCard>
  </div>
</template>

<style>
</style>
