<script setup lang="ts">
import { h, reactive, ref } from 'vue'
import { NButton, NCard, NDatePicker, NForm, NFormItem, NIcon, NInput, NModal, NSpace } from 'naive-ui'
import { PlusOutlined } from '@vicons/antd'
import { type FormRules } from 'naive-ui'
import BasicTable from './Table.vue'
import { columns } from './columns'
import TableAction from './TableAction.vue'
import NewTable from './NewTable.vue'
import type { Recordable } from '@/typings/global'
// import { http } from '@/utils/http/axios'

// const message = useMessage()

const showModal = ref(false)
const formBtnLoading = ref(false)
const formRef: any = ref(null)

const formParams = reactive({
  name: '',
  address: '',
  date: null,
})
const rules: FormRules = {
  name: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入名称',
  },
  address: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入地址',
  },
  date: {
    type: 'number',
    required: true,
    trigger: ['blur', 'change'],
    message: '请选择日期',
  },
}
const params = ref({
  pageSize: 5,
  name: 'xiaoMa',
})
const actionColumn = reactive({
  width: 220,
  title: '操作',
  key: 'action',
  fixed: 'right',
  render(record: any) {
    return h(TableAction as any, {
      style: 'button',
      actions: [
        {
          label: '删除',
          onClick: handleDelete.bind(null, record),
          // 根据业务控制是否显示 isShow 和 auth 是并且关系
          ifShow: () => {
            return true
          },
          // 根据权限控制是否显示: 有权限，会显示，支持多个
          auth: ['basic_list'],
        },
        {
          label: '编辑',
          onClick: handleEdit.bind(null, record),
          ifShow: () => {
            return true
          },
          auth: ['basic_list'],
        },
      ],
      dropDownActions: [
        {
          label: '启用',
          key: 'enabled',
          // 根据业务控制是否显示: 非enable状态的不显示启用按钮
          ifShow: () => {
            return true
          },
        },
        {
          label: '禁用',
          key: 'disabled',
          ifShow: () => {
            return true
          },
        },
      ],
      select: (key: any) => {
        // window.$message.info(`您点击了，${key} 按钮`)
      },
    })
  },
})

function handleEdit(record: Recordable) {
  // console.log('点击了编辑', record)
  // router.push({ name: 'basic-info', params: { id: record.id } })
}

function handleDelete(record: Recordable) {
  // console.log('点击了删除', record)
  // window.$message.info('点击了删除')
}
function onCheckedRow(rowKeys: any) {
}
// function cancelCallback() {
//   message.success('Cancel')
// }

// function submitCallback() {
//   message.success('Submit')
// }
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

// 获取table
function getTableList(params: any) {

}
const loadDataTable = async (res: any) => {
  return await getTableList({ ...formParams, ...params.value, ...res })
}
</script>

<template>
  <NCard :bordered="false" class="proCard">
    <NButton type="primary" @click="showModal = true">
      <template #icon>
        <NIcon>
          <PlusOutlined />
        </NIcon>
      </template>
      新建套餐
    </NButton>
    <!-- <NModal
    v-model:show="showModal"
    preset="dialog"
    title="确认"
    content="你确认?"
    positive-text="确认"
    negative-text="算了"
    @positive-click="submitCallback"
    @negative-click="cancelCallback"
  /> -->
    <NModal v-model:show="showModal" :show-icon="false" preset="dialog" title="新建套餐">
      <NForm
        ref="formRef"
        :model="formParams"
        :rules="rules"
        label-placement="left"
        :label-width="80"
        class="py-4"
      >
        <NFormItem label="名称" path="name">
          <NInput v-model:value="formParams.name" placeholder="请输入名称" />
        </NFormItem>
        <NFormItem label="地址" path="address">
          <NInput v-model:value="formParams.address" type="textarea" placeholder="请输入地址" />
        </NFormItem>
        <NFormItem label="日期" path="date">
          <NDatePicker v-model:value="formParams.date" type="datetime" placeholder="请选择日期" />
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
    <BasicTable
      ref="actionRef"
      :columns="columns"
      :request="loadDataTable"
      :action-column="actionColumn"
      :scroll-x="1090"
      @update:checked-row-keys="onCheckedRow"
    />
    <NewTable />
  </NCard>
</template>
