<script lang="ts" setup>
import { ref } from 'vue'
import { NButton, NInput, useMessage, NSpin } from 'naive-ui'
import { useSettingStore } from '@/store'
import type { SettingsState } from '@/store/modules/settings/helper'
import { t } from '@/locales'
// import post from '@/utils/request'
import { addPassword, removePassword } from '@/api'
import { error } from 'console'

const settingStore = useSettingStore()

const ms = useMessage()

const adminToken = ref(settingStore.password ?? '')
const addToken = ref('')
const deleteToken = ref('')
const loading = ref(false)

function updateSettings(options: Partial<SettingsState>) {
  settingStore.updateSetting(options)
  ms.success(t('common.success'))
}

async function addPasswd(pw: string) {
	try {
		loading.value = true
	  const {message } = await addPassword(pw, adminToken.value)
		ms.success(message ?? '')
	}
	catch(error: any) {
		ms.error(error.message ?? '')
	}
	finally {
	  loading.value = false
	}
}

async function removePasswd(pw: string) {
	try {
		loading.value = true
	  const {message } = await removePassword(pw, adminToken.value)
		ms.success(message ?? '')
	}
	catch(error: any) {
		ms.error(error.message ?? '')
	}
	finally {
	  loading.value = false
	}
}

</script>

<template>
	<NSpin :show="loading">
  <div class="p-4 space-y-5 min-h-[200px]">
    <div class="space-y-6">
			<!-- 管理员密码 -->
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[120px]">{{ $t('setting.admin') }}</span>
        <div class="flex-1">
          <NInput v-model:value="adminToken" type="textarea" :autosize="{ minRows: 1, maxRows: 4 }" />
        </div>
				<NButton size="tiny" text type="primary" @click="updateSettings({ 'password':adminToken })">
				  {{ $t('common.save') }}
				</NButton>
      </div>
			<!-- 添加密码 -->
			<div class="flex items-center space-x-4">
			  <span class="flex-shrink-0 w-[120px]">{{ $t('setting.addPw') }}</span>
			  <div class="flex-1">
			    <NInput v-model:value="addToken" type="textarea" :autosize="{ minRows: 1, maxRows: 4 }" />
			  </div>
			  <NButton size="tiny" text type="primary" @click="addPasswd(addToken)">
			    {{ $t('common.save') }}
			  </NButton>
			</div>
			<!-- 删除密码 -->
			<div class="flex items-center space-x-4">
			  <span class="flex-shrink-0 w-[120px]">{{ $t('setting.deletePw') }}</span>
			  <div class="flex-1">
			    <NInput v-model:value="deleteToken" type="textarea" :autosize="{ minRows: 1, maxRows: 4 }" />
			  </div>
			  <NButton size="tiny" text type="primary" @click="removePasswd(deleteToken)">
			    {{ $t('common.save') }}
			  </NButton>
			</div>

    </div>
  </div>
	</NSpin>
</template>
