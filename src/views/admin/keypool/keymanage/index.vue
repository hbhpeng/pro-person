<script setup lang="ts">
import { NButton, NCard, NEllipsis, NInput, NSpace, NSpin, NTable, useDialog, useMessage } from 'naive-ui'
import { ref, watch } from 'vue'
import moment from 'moment'
import {
  changeOpenApi,
  deleteOpenApi,
  fetchChatConfig,
  reqOpenApiKeys,
} from '@/api'

interface KeyStoreType {
  key: string
  lastmodify: string
}

const keystores = ref<KeyStoreType[]>([{ key: '123123123123123123123', lastmodify: '344' }, { key: '123', lastmodify: '344' }])
const loading = ref(false)
const ms = useMessage()
const openapi = ref('')
const currentOpenapi = ref('')
const dialog = useDialog()
const usage = ref('')

async function requestKeys() {
  loading.value = true
  try {
    const { data } = await reqOpenApiKeys() as { data: any }
    const dataObject = JSON.parse(data)
    keystores.value = (dataObject.allkey as any).map((value: any) => {
      value.lastmodify = moment(value.lastmodify).format('YYYY-MM-DD HH:mm:ss')
      return value
    })
    currentOpenapi.value = dataObject.usekey as any
  }
  catch (error: any) {
    ms.error(error.message ?? '查询失败')
  }
  finally {
    loading.value = false
  }
}

async function requestKeyUsage() {
  try {
    const { data } = await fetchChatConfig()
    usage.value = data.usage as string
  }
  catch {
    usage.value = '获取使用量失败'
  }
}

watch(
  () => currentOpenapi.value,
  async (value) => {
    if (value)
      await requestKeyUsage()
  },
  { deep: true },
)

// 请求所有的key
requestKeys()

const changeKeyWithParam = async (cKey?: string) => {
  const keyParam: string = cKey ?? openapi.value
  try {
    loading.value = true
    const {
      message,
    } = await changeOpenApi(keyParam)
    currentOpenapi.value = keyParam
    // currentopenapi插入列表
    keystores.value = keystores.value.filter((value) => {
      return value.key !== keyParam
    })
    keystores.value = [{ key: keyParam, lastmodify: moment().format('YYYY-MM-DD HH:mm:ss') }, ...(keystores.value)]
    openapi.value = ''
    ms.success(message ?? '')
  }
  catch (error: any) {
    ms.error(error.message ?? '')
  }
  finally {
    loading.value = false
  }
}

const changeKey = async () => {
  changeKeyWithParam()
}

const enableKey = async (keystore: KeyStoreType) => {
  changeKeyWithParam(keystore.key)
}

async function realDeleteKey(keystore: KeyStoreType) {
  loading.value = true
  try {
    const {
      message,
    } = await deleteOpenApi(keystore.key)
    keystores.value = keystores.value.filter((value) => {
      return value.key !== keystore.key
    })
    ms.success(message ?? '')
  }
  catch (error: any) {
    ms.error(error.message ?? '删除失败')
  }
  finally {
    loading.value = false
  }
}

const deleteKey = async (keystore: KeyStoreType) => {
  if (keystore.key === currentOpenapi.value) {
    dialog.warning({
      title: '警告',
      content: '这个秘钥是当前正在使用的秘钥，确定要删除吗？',
      positiveText: '确定',
      negativeText: '不确定',
      onPositiveClick: () => {
        realDeleteKey(keystore)
      },
    })
  }
  realDeleteKey(keystore)
}
</script>

<template>
  <div>
    <NCard title="key池管理">
      <NSpace vertical>
        <NEllipsis expand-trigger="click" line-clamp="2" :tooltip="false">
          当前秘钥：{{ currentOpenapi }}
        </NEllipsis>
        <NEllipsis expand-trigger="click" line-clamp="1" :tooltip="false">
          当月使用量：{{ usage }}
        </NEllipsis>
        <NSpin :show="loading">
          <NSpace vertical>
            <NInput v-model:value="openapi" placeholder="请输入需要更换的秘钥,最好复制粘贴" />
            <NButton @click="changeKey">
              确认更换
            </NButton>

            <NTable :bordered="true" :single-line="false" striped>
              <thead>
                <tr>
                  <th>秘钥</th>
                  <th>上次使用</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(keystore, index) in keystores" :key="index">
                  <td>{{ keystore.key }}</td>
                  <td>{{ keystore.lastmodify }}</td>
                  <td>
                    <NButton :disabled="keystore.key === currentOpenapi" @click="enableKey(keystore)">
                      {{ keystore.key === currentOpenapi ? '已启用' : '启用' }}
                    </NButton>
                    <NButton style="margin-left: 10px;" @click="deleteKey(keystore)">
                      删除
                    </NButton>
                  </td>
                </tr>
              </tbody>
            </NTable>
          </NSpace>
        </NSpin>
      </NSpace>
    </NCard>
  </div>
</template>

<style>
</style>
