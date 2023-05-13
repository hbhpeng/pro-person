<script setup lang="ts">
import { NButton, NCard, NForm, NFormItem, NInput, NSpace, useMessage } from 'naive-ui'
import { reactive, ref } from 'vue'

const message = useMessage()
const formRef: any = ref(null)
const rules = {
  name: {
    required: true,
    message: '请输入用户名',
    trigger: 'blur',
  },
  oldpassword: {
    required: true,
    message: '请输入旧密码',
    trigger: 'blur',
  },
  newpassword: {
    required: true,
    message: '请输入新密码',
    trigger: 'blur',
  },
  repeatpassword: {
    required: true,
    message: '请再输一次密码',
    trigger: 'input',
  },
}

const formValue = reactive({
  oldpw: '',
  name: '',
  newpw: '',
  reppw: '',
})

function formSubmit() {
  formRef.value.validate((errors) => {
    if (!errors)
      message.success('验证成功')
    else
      message.error('验证失败，请填写完整信息')
  })
}
</script>

<template>
  <div>
    <NCard title="修改登录密码">
      <NForm ref="formRef" :label-width="80" :model="formValue" :rules="rules">
        <NFormItem label="用户名" path="name">
          <NInput v-model:value="formValue.name" placeholder="请输入用户名" />
        </NFormItem>

        <NFormItem label="旧密码" path="oldpassword">
          <NInput v-model:value="formValue.oldpw" type="password" placeholder="请输入旧密码" />
        </NFormItem>

        <NFormItem label="新密码" path="newpassword">
          <NInput v-model:value="formValue.newpw" type="password" placeholder="请输入新密码" />
        </NFormItem>
        <NFormItem label="重复密码" path="repeatpassword">
          <NInput v-model:value="formValue.reppw" type="password" placeholder="请再次密码" />
        </NFormItem>

        <div>
          <NSpace>
            <NButton type="primary" @click="formSubmit">
              更新密码
            </NButton>
          </NSpace>
        </div>
      </NForm>
    </NCard>
  </div>
</template>

<style>
</style>
