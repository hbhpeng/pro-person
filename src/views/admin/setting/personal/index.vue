<script setup lang="ts">
import { NButton, NCard, NForm, NFormItem, NInput, NSpace, NSpin, useMessage } from 'naive-ui'
import { computed, reactive, ref } from 'vue'
import {
  adminChangePassword,
} from '@/api'

const message = useMessage()
const formRef: any = ref('formRef')
const loading = ref(false)
const rules = {
  name: {
    required: true,
    message: '请输入用户名',
    trigger: 'blur',
  },
  oldpw: {
    required: true,
    message: '请输入旧密码',
    trigger: 'blur',
  },
  newpw: {
    required: true,
    message: '请输入新密码',
    trigger: 'blur',
  },
  reppw: {
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

async function formSubmit() {
  formRef.value.validate(async (errors: any) => {
    if (!errors) {
      loading.value = true
      try {
        await adminChangePassword(formValue.name, formValue.oldpw, formValue.newpw)
        message.success('密码修改成功')
        formValue.name = formValue.oldpw = formValue.newpw = formValue.reppw = ''
      }
      catch (error: any) {
        message.error(error.message ?? '修改密码失败')
      }
      finally {
        loading.value = false
      }
    }
    else { message.error('验证失败，请填写完整信息') }
  })
}

const canSubmit = computed(() => {
  return formValue.oldpw && formValue.name && formValue.newpw && formValue.reppw && (formValue.newpw === formValue.reppw)
})
</script>

<template>
  <div>
    <NSpin :show="loading">
      <NCard title="修改登录密码">
        <NForm ref="formRef" :label-width="80" :model="formValue" :rules="rules">
          <NFormItem label="用户名" path="name">
            <NInput v-model:value="formValue.name" placeholder="请输入用户名" />
          </NFormItem>

          <NFormItem label="旧密码" path="oldpw">
            <NInput v-model:value="formValue.oldpw" :input-props="{ autocomplete: 'new-password' }" type="password" placeholder="请输入旧密码" />
          </NFormItem>

          <NFormItem label="新密码" path="newpw">
            <NInput v-model:value="formValue.newpw" type="password" placeholder="请输入新密码" />
          </NFormItem>
          <NFormItem label="重复密码" path="reppw">
            <NInput v-model:value="formValue.reppw" type="password" placeholder="请再次输入密码" />
          </NFormItem>

          <div>
            <NSpace>
              <NButton :disabled="!canSubmit" @click="formSubmit">
                更新密码
              </NButton>
            </NSpace>
          </div>
        </NForm>
      </NCard>
    </NSpin>
  </div>
</template>

<style>
</style>
