<script setup lang="ts">
import { reactive, ref } from 'vue'
import { NAutoComplete, NButton, NCard, NForm, NFormItem, NIcon, NInput, NModal, NSpace, NSpin, useLoadingBar, useMessage } from 'naive-ui'
import { PlusOutlined } from '@vicons/antd'
import { type FormRules } from 'naive-ui'
import ProxyUserList from './PsStationList.vue'
import {
  addPsStation,
  deletePsStaion,
  queryPsStationlist,
} from '@/api'

interface PersonStation {
  id: number
  authcode: string
  nickname: string
  weburl: string
  reverse: string
  openaikey: string
}

const message = useMessage()
const loadingbar = useLoadingBar()

const showModal = ref(false)
// const showInfo = ref(false)
const formBtnLoading = ref(false)
const formRef: any = ref(null)
const loading = ref(false)
// const settleSalerId = ref('')

let formParams = reactive({
  id: -1,
  nickname: '',
  authcode: '',
  reverse: '',
  weburl: '',
  openaikey: '',
})

const rules: FormRules = {
  nickname: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入个人站名称',
  },
  authcode: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入个人站授权码',
  },
  weburl: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入个人站网址',
  },
  openaikey: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入openaikey',
  },
}

const proxylistShow = ref<PersonStation[]>([])

const editItem = (item: PersonStation) => {
  // console.log(item)
  showModal.value = true
  formParams = reactive(item)
}

const deleteItem = async (item: PersonStation) => {
  loading.value = true
  try {
    await deletePsStaion(item)
    proxylistShow.value = proxylistShow.value.filter((tmp) => {
      return tmp.id !== item.id
    })
    message.success('删除成功')
  }
  catch (error: any) {
    message.error(error.message)
  }
  finally {
    formBtnLoading.value = false
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
      const { message: pid } = await addPsStation(formParams)
      const id = parseInt(pid as string)
      if (formParams.id < 0)
        proxylistShow.value.unshift({ ...formParams, id })

      formParams = reactive({
        id: -1,
        nickname: '',
        authcode: '',
        reverse: '',
        weburl: '',
        openaikey: '',
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

async function gerSalersList() {
  try {
    loadingbar.start()
    const { data } = await queryPsStationlist()
    proxylistShow.value = JSON.parse(data as string) as PersonStation[]
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
        <NButton type="primary" @click="showModal = true">
          <template #icon>
            <NIcon>
              <PlusOutlined />
            </NIcon>
          </template>
          新增个人站
        </NButton>
        <NModal v-model:show="showModal" :show-icon="false" preset="dialog" title="新增代理商">
          <NForm ref="formRef" :model="formParams" :rules="rules" label-placement="left" :label-width="80" class="py-4">
            <NFormItem label="个人站名称" path="nickname">
              <NAutoComplete v-model:value="formParams.nickname" placeholder="个人站名称" />
            </NFormItem>
            <NFormItem label="授权码" path="authcode">
              <NInput v-model:value="formParams.authcode" placeholder="授权码" />
            </NFormItem>
            <NFormItem label="网站地址" path="weburl">
              <NInput v-model:value="formParams.weburl" placeholder="根地址" />
            </NFormItem>
            <NFormItem label="openaikey" path="openaikey">
              <NInput v-model:value="formParams.openaikey" placeholder="openaikey" />
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
            :pro-list="proxylistShow" @edit-item="editItem" @delete-item="deleteItem"
          />
        </NSpin>
      </NSpace>
    </NCard>
  </div>
</template>

<style>
</style>
