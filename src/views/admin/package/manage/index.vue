<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { NAutoComplete, NButton, NCard, NForm, NFormItem, NIcon, NInput, NInputNumber, NModal, NSpace } from 'naive-ui'
import { PlusOutlined } from '@vicons/antd'
import { type FormRules } from 'naive-ui'
import NewTable from './NewTable.vue'
// import { http } from '@/utils/http/axios'

// const message = useMessage()

const showModal = ref(false)
const formBtnLoading = ref(false)
const formRef: any = ref(null)

const formParams = reactive({
  name: '',
  wordNum: 0,
  originPrice: '',
  nowPrice: 0,
  description: '',
})
const rules: FormRules = {
  name: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入套餐名称',
  },
  wordNum: {
    type: 'number',
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入字数',
  },
  originPrice: {
    required: false,
    trigger: ['blur', 'input'],
    message: '可以不用数字',
  },
  nowPrice: {
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
}

interface VipOption {
  name: string
  long: number // 1: 7天 2: 1个月 3: 1个季度 4: 1年
}

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

function confirmForm(e: { preventDefault: () => void }) {
  e.preventDefault()
  formBtnLoading.value = true
  formRef.value.validate((errors: any) => {
    // if (!errors) {
    //   window.$message.success('新建成功')
    //   setTimeout(() => {
    //     showModal.value = false
    //     reloadTable()
    //   })
    // }
    // else {
    //   window.$message.error('请填写完整信息')
    // }
    formBtnLoading.value = false
  })
}
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
        <NForm
          ref="formRef"
          :model="formParams"
          :rules="rules"
          label-placement="left"
          :label-width="80"
          class="py-4"
        >
          <NFormItem label="套餐名称" path="name">
            <NAutoComplete
              v-model:value="formParams.name"
              :options="nameOptions"
              :get-show="nameGetShow"
              placeholder="套餐名称"
            />
          </NFormItem>
          <NFormItem label="字数" path="wordNum">
            <NInputNumber v-model:value="formParams.wordNum" placeholder="字数" style="width: 100%;">
              <template #suffix>
                万
              </template>
            </NInputNumber>
          </NFormItem>
          <NFormItem label="原价" path="originPrice" type="number">
            <NInput v-model:value="formParams.originPrice" placeholder="原价" />
          </NFormItem>
          <NFormItem label="现价" path="nowPrice" type="number">
            <NInputNumber v-model:value="formParams.nowPrice" placeholder="现价" style="width: 100%;">
              <template #suffix>
                元
              </template>
            </NInputNumber>
          </NFormItem>
          <NFormItem label="描述" path="description">
            <NInput v-model:value="formParams.description" type="textarea" placeholder="描述" />
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
      <NewTable />
    </NSpace>
  </NCard>
</template>
