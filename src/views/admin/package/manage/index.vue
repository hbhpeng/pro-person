<script setup lang="ts">
import { reactive, ref } from 'vue'
import { NButton, NCard, NForm, NFormItem, NIcon, NInput, NModal, NSpace } from 'naive-ui'
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
  wordNum: '',
  originPrice: '',
  nowPrice: '',
  description: '',
})
const rules: FormRules = {
  name: {
    required: true,
    trigger: ['blur', 'input'],
    message: '套餐名称',
  },
  wordNum: {
    required: true,
    trigger: ['blur', 'input'],
    message: '字数',
  },
  originPrice: {
    required: true,
    trigger: ['blur', 'input'],
    message: '原价',
  },
  nowPrice: {
    required: true,
    trigger: ['blur', 'input'],
    message: '现价',
  },
  description: {
    required: true,
    trigger: ['blur', 'input'],
    message: '描述',
  },
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
            <NInput v-model:value="formParams.name" placeholder="套餐名称" />
          </NFormItem>
          <NFormItem label="字数" path="address">
            <NInput v-model:value="formParams.wordNum" placeholder="字数" />
          </NFormItem>
          <NFormItem label="原价" path="address" type="number">
            <NInput v-model:value="formParams.originPrice" placeholder="原价" />
          </NFormItem>
          <NFormItem label="现价" path="address" type="number">
            <NInput v-model:value="formParams.nowPrice" placeholder="现价" />
          </NFormItem>
          <NFormItem label="描述" path="address">
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
