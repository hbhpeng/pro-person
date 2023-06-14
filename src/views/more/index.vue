<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  NAutoComplete, NButton, NInput, NLayout, NLayoutFooter, NLayoutHeader,
  NLayoutSider, NMenu,
} from 'naive-ui'

// import { storeToRefs } from 'pinia'
// import type { MenuOption } from 'naive-ui/lib/menu'
import type { MenuOption } from 'naive-ui'
import { useUsingContext } from '../chat/hooks/useUsingContext'
import HeaderComponent from '../chat/components/Header/index.vue'
import { Message } from '../chat/components'
import { useScroll } from '../chat/hooks/useScroll'
import PromptRecommend from '../../assets/prompt_custom.json'
import MenuCofig from './menu/config'

import { useBasicLayout } from '@/hooks/useBasicLayout'
import { HoverButton, SvgIcon } from '@/components/common'
import { useRoleChatStore } from '@/store/modules/chat/roleStore'
import { fetchChatAPIProcess, getPromotImage } from '@/api'
import { t } from '@/locales'
// import { router } from '@/router'

const { isMobile } = useBasicLayout()
const inverted = ref(false)
const { usingContext, toggleUsingContext } = useUsingContext()
function handleExport() {}
const footerClass = computed(() => {
  let classes = ['p-4']
  if (isMobile.value)
    classes = ['sticky', 'left-0', 'bottom-0', 'right-0', 'p-2', 'pr-3', 'overflow-hidden']
  return classes
})
const menuOptions = MenuCofig

/// ///////Message
const chatStore = useRoleChatStore()
let controller = new AbortController()
const loading = ref<boolean>(false)
const dialog = useDialog()

const openLongReply = import.meta.env.VITE_GLOB_OPEN_LONG_REPLY === 'true'

const pageTitle = ref(chatStore.active as string)

const dataSources = computed(() => chatStore.getChatByLabel(pageTitle.value))

async function onRegenerate(index: number) {
  if (loading.value)
    return

  controller = new AbortController()

  const { requestOptions } = dataSources.value[index]

  let message = requestOptions?.prompt ?? ''

  let options: Chat.ConversationRequest = {}

  if (requestOptions.options)
    options = { ...requestOptions.options }

  loading.value = true

  chatStore.updateChatByLabel(
    pageTitle.value,
    index,
    {
      dateTime: new Date().toLocaleString(),
      text: '',
      inversion: false,
      error: false,
      loading: true,
      conversationOptions: null,
      requestOptions: { prompt: message, options: { ...options } },
    },
  )

  try {
    let lastText = ''
    const fetchChatAPIOnce = async () => {
      await fetchChatAPIProcess<Chat.ConversationResponse>({
        prompt: message,
        options,
        signal: controller.signal,
        onDownloadProgress: ({ event }) => {
          const xhr = event.target
          const { responseText } = xhr
          // Always process the final line
          const lastIndex = responseText.lastIndexOf('\n', responseText.length - 2)
          let chunk = responseText
          if (lastIndex !== -1)
            chunk = responseText.substring(lastIndex)
          try {
            const data = JSON.parse(chunk)
            chatStore.updateChatByLabel(
              pageTitle.value,
              index,
              {
                dateTime: new Date().toLocaleString(),
                text: lastText + (data.text ?? ''),
                inversion: false,
                error: false,
                loading: true,
                conversationOptions: { conversationId: data.conversationId, parentMessageId: data.id },
                requestOptions: { prompt: message, options: { ...options } },
              },
            )
            // 判断openLongReply是否为空
            if (openLongReply && data.detail.choices[0].finish_reason === 'length') {
              options.parentMessageId = data.id
              lastText = data.text
              message = ''
              return fetchChatAPIOnce()
            }
          }
          catch (error) {
            //
          }
        },
      })
      chatStore.updateChatSomeByLabel(pageTitle.value, index, { loading: false })
    }
    await fetchChatAPIOnce()
  }
  catch (error: any) {
    if (error.message === 'canceled') {
      chatStore.updateChatSomeByLabel(
        pageTitle.value,
        index,
        {
          loading: false,
        },
      )
      return
    }

    const errorMessage = error?.message ?? t('common.wrong')

    chatStore.updateChatByLabel(
      pageTitle.value,
      index,
      {
        dateTime: new Date().toLocaleString(),
        text: errorMessage,
        inversion: false,
        error: true,
        loading: false,
        conversationOptions: null,
        requestOptions: { prompt: message, options: { ...options } },
      },
    )
  }
  finally {
    loading.value = false
  }
}

function handleDelete(index: number) {
  if (loading.value)
    return

  dialog.warning({
    title: t('chat.deleteMessage'),
    content: t('chat.deleteMessageConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: () => {
      chatStore.deleteChatByLabel(pageTitle.value, index)
    },
  })
}

/// /////footer event
// const ms = useMessage()
const conversationList = computed(() => dataSources.value.filter(item => (!item.inversion && !!item.conversationOptions)))
const { scrollRef, scrollToBottom, scrollToBottomIfAtBottom } = useScroll()

const prompt = ref<string>('')

const buttonDisabled = computed(() => {
  return loading.value || !prompt.value || prompt.value.trim() === ''
})

function handleSubmit() {
  onConversation()
}

async function onConversation() {
  let message = prompt.value

  if (loading.value)
    return

  if (!message || message.trim() === '')
    return

  controller = new AbortController()

  chatStore.addChatByLabel(
    pageTitle.value,
    {
      dateTime: new Date().toLocaleString(),
      text: message,
      inversion: true,
      error: false,
      conversationOptions: null,
      requestOptions: { prompt: message, options: null },
    },
  )
  scrollToBottom()

  loading.value = true
  prompt.value = ''

  let options: Chat.ConversationRequest = {}
  const lastContext = conversationList.value[conversationList.value.length - 1]?.conversationOptions

  if (lastContext && usingContext.value)
    options = { ...lastContext }

  chatStore.addChatByLabel(
    pageTitle.value,
    {
      dateTime: new Date().toLocaleString(),
      text: '',
      loading: true,
      inversion: false,
      error: false,
      conversationOptions: null,
      requestOptions: { prompt: message, options: { ...options } },
    },
  )
  scrollToBottom()

  // 是否要求发送图片
  async function checkIfImage() {
    if (message.indexOf('[img]') === 0) {
      const {
        data,
      } = await getPromotImage(message.substring(5, message.length), controller.signal)
      const imageContent: string = JSON.parse(data as string).content
      chatStore.updateChatSomeByLabel(
        pageTitle.value,
        dataSources.value.length - 1, {
          dateTime: new Date().toLocaleString(),
          text: imageContent,
          inversion: false,
          error: false,
          loading: false,
        },
      )
      return true
    }
    return false
  }

  try {
    // 问图片
    if (await checkIfImage())
      return

    let lastText = ''
    const fetchChatAPIOnce = async () => {
      await fetchChatAPIProcess<Chat.ConversationResponse>({
        prompt: message,
        options,
        signal: controller.signal,
        onDownloadProgress: ({ event }) => {
          const xhr = event.target
          const { responseText } = xhr
          // Always process the final line
          const lastIndex = responseText.lastIndexOf('\n', responseText.length - 2)
          let chunk = responseText
          if (lastIndex !== -1)
            chunk = responseText.substring(lastIndex)
          try {
            const data = JSON.parse(chunk)
            chatStore.updateChatByLabel(
              pageTitle.value,
              dataSources.value.length - 1,
              {
                dateTime: new Date().toLocaleString(),
                text: lastText + (data.text ?? ''),
                inversion: false,
                error: false,
                loading: true,
                conversationOptions: { conversationId: data.conversationId, parentMessageId: data.id },
                requestOptions: { prompt: message, options: { ...options } },
              },
            )

            if (openLongReply && data.detail.choices[0].finish_reason === 'length') {
              options.parentMessageId = data.id
              lastText = data.text
              message = ''
              return fetchChatAPIOnce()
            }

            scrollToBottomIfAtBottom()
          }
          catch (error) {
            //
          }
        },
      })
      chatStore.updateChatSomeByLabel(pageTitle.value, dataSources.value.length - 1, { loading: false })
    }

    await fetchChatAPIOnce()
  }
  catch (error: any) {
    const errorMessage = error?.message ?? t('common.wrong')

    if (error.message === 'canceled') {
      chatStore.updateChatSomeByLabel(
        pageTitle.value,
        dataSources.value.length - 1,
        {
          loading: false,
        },
      )
      scrollToBottomIfAtBottom()
      return
    }

    const currentChat = chatStore.getChatByLabelAndIndex(pageTitle.value, dataSources.value.length - 1)

    if (currentChat?.text && currentChat.text !== '') {
      chatStore.updateChatSomeByLabel(
        pageTitle.value,
        dataSources.value.length - 1,
        {
          text: `${currentChat.text}\n[${errorMessage}]`,
          error: false,
          loading: false,
        },
      )
      return
    }

    chatStore.updateChatByLabel(
      pageTitle.value,
      dataSources.value.length - 1,
      {
        dateTime: new Date().toLocaleString(),
        text: errorMessage,
        inversion: false,
        error: true,
        loading: false,
        conversationOptions: null,
        requestOptions: { prompt: message, options: { ...options } },
      },
    )
    scrollToBottomIfAtBottom()
  }
  finally {
    loading.value = false
  }
}

/// input event

const placeholder = computed(() => {
  if (isMobile.value)
    return t('chat.placeholderMobile')
  return t('chat.placeholder')
})

function handleEnter(event: KeyboardEvent) {
  if (!isMobile.value) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }
  else {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault()
      handleSubmit()
    }
  }
}

/// ///main标签 event

function handleStop() {
  if (loading.value) {
    controller.abort()
    loading.value = false
  }
}
/// ////提词器相关

// const promptStore = usePromptStore()
// 使用storeToRefs，保证store修改后，联想部分能够重新渲染
// const { promptList: promptTemplate } = storeToRefs<any>(promptStore)
const promptTemplate = PromptRecommend

menuOptions.forEach((item: MenuOption, i: number) => {
  item.children?.forEach((item: MenuOption, j: number) => {
    const promp = promptTemplate[i][j]
    item.act = promp.act
    item.prompt = promp.prompt
  })
})
// for (let i = 0; i < menuOptions.length; i++) {
//   const element: MenuOption = menuOptions[i]
//   const child: MenuOption[] | undefined = element?.children
//   for (let j = 0; j < child?child.length:0; j++) {
//     const element: MenuOption = child.children[j]
//     const promp = promptTemplate[i][j]
//     element.act = promp.act
//     element.prompt = promp.prompt
//   }
// }
// const promptList = ref<any>(promptStore.promptList)
// // 移动端自适应相关
// const renderTemplate = () => {
//   const [keyLimit, valueLimit] = isMobile.value ? [10, 30] : [15, 50]

//   return promptList.value.map((item: { key: string; value: string }) => {
//     return {
//       renderKey: item.key.length <= keyLimit ? item.key : `${item.key.substring(0, keyLimit)}...`,
//       renderValue: item.value.length <= valueLimit ? item.value : `${item.value.substring(0, valueLimit)}...`,
//       key: item.key,
//       value: item.value,
//     }
//   })
// }

// const dataSource = computed(() => {
//   const data = renderTemplate()
//   const value = searchValue.value
//   if (value && value !== '') {
//     return data.filter((item: DataProps) => {
//       return item.renderKey.includes(value) || item.renderValue.includes(value)
//     })
//   }
//   return data
// })
// 可优化部分
// 搜索选项计算，这里使用value作为索引项，所以当出现重复value时渲染异常(多项同时出现选中效果)
// 理想状态下其实应该是key作为索引项,但官方的renderOption会出现问题，所以就需要value反renderLabel实现
const searchOptions = computed(() => {
  /*
  if (prompt.value.startsWith('/')) {
    return promptTemplate.value.filter((item: { key: string }) => item.key.toLowerCase().includes(prompt.value.substring(1).toLowerCase())).map((obj: { value: any }) => {
      return {
        label: obj.value,
        value: obj.value,
      }
    })
  }
  else { */
  return []
  // }
})
// value反渲染key
const renderOption = (option: { label: string }) => {
  // for (const i of promptTemplate.value) {
  //   if (i.value === option.label)
  //     return [i.key]
  // }
  return []
}
/// //左侧菜单点击事件
function handleUpdateValue(key: string, item: MenuOption) {
  // const index = menuOptions.indexOf(item)
  // let menuValue = JSON.stringify(item.label)
  // menuValue = menuValue.substring(1, menuValue.length - 1)
  // const filterArr = promptTemplate.value.filter((item1: { key: string; value: string }) => {
  //   return item1.key.includes(menuValue) || item1.value.includes(menuValue)
  // })
  // prompt.value = filterArr.length > 0 ? filterArr[0].value : '没有找到合适的提示语'
  prompt.value = item.prompt as string
  pageTitle.value = item.label as string
  chatStore.addHistory({
    title: pageTitle.value,
    uuid: Date.now(),
    isEdit: false,
  })
}

onMounted(() => {
  scrollToBottom()
})

onUnmounted(() => {
  if (loading.value)
    controller.abort()
})
</script>

<template>
  <div class="flex flex-col w-full h-full">
    <header>
      <NLayoutHeader :inverted="inverted" bordered>
        <HeaderComponent
          v-if="isMobile"
          :using-context="usingContext"
          :is-showback="true"
          :page-title="pageTitle"
          @export="handleExport"
          @toggle-using-context="toggleUsingContext"
        />
      </NLayoutHeader>
    </header>
    <NLayout has-sider>
      <NLayoutSider
        bordered
        collapse-mode="width"
        :collapsed-width="64"
        :width="240"
        show-trigger
        :inverted="inverted"
      >
        <NMenu
          :inverted="inverted"
          :collapsed-width="64"
          :collapsed-icon-size="22"
          :options="menuOptions"
          @update:value="handleUpdateValue"
        />
      </NLayoutSider>

      <NLayout>
        <div class="flex flex-col w-full h-full">
          <main class="flex-1 overflow-hidden">
            <div id="scrollRef" ref="scrollRef" class="h-full overflow-hidden overflow-y-auto">
              <div
                id="image-wrapper"
                class="w-full max-w-screen-xl m-auto dark:bg-[#101014]"
                :class="[isMobile ? 'p-2' : 'p-4']"
              >
                <template v-if="!dataSources.length">
                  <div class="flex items-center justify-center mt-4 text-center text-neutral-300">
                    <SvgIcon icon="ri:bubble-chart-fill" class="mr-2 text-3xl" />
                    <span>Aha~</span>
                  </div>
                </template>
                <template v-else>
                  <div>
                    <Message
                      v-for="(item, index) of dataSources"
                      :key="index"
                      :date-time="item.dateTime"
                      :text="item.text"
                      :inversion="item.inversion"
                      :error="item.error"
                      :loading="item.loading"
                      @regenerate="onRegenerate(index)"
                      @delete="handleDelete(index)"
                    />
                    <div class="sticky bottom-0 left-0 flex justify-center">
                      <NButton v-if="loading" type="warning" @click="handleStop">
                        <template #icon>
                          <SvgIcon icon="ri:stop-circle-line" />
                        </template>
                        Stop Responding
                      </NButton>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </main>
        </div>
      </NLayout>
    </NLayout>
    <NLayoutFooter :inverted="inverted" bordered>
      <footer :class="footerClass">
        <div class="w-full max-w-screen-xl m-auto">
          <div class="flex items-center justify-between space-x-2">
            <HoverButton tooltip="清空">
              <span class="text-xl text-[#4f555e] dark:text-white">
                <SvgIcon icon="ri:delete-bin-line" />
              </span>
            </HoverButton>
            <HoverButton v-if="!isMobile" tooltip="导出" @click="handleExport">
              <span class="text-xl text-[#4f555e] dark:text-white">
                <SvgIcon icon="ri:download-2-line" />
              </span>
            </HoverButton>
            <HoverButton v-if="!isMobile" @click="toggleUsingContext">
              <span class="text-xl" :class="{ 'text-[#6aa1e7]': usingContext, 'text-[#a8071a]': !usingContext }">
                <SvgIcon icon="ri:chat-history-line" />
              </span>
            </HoverButton>
            <NAutoComplete v-model:value="prompt" :options="searchOptions" :render-label="renderOption">
              <template #default="{ handleInput, handleBlur, handleFocus }">
                <NInput
                  ref="inputRef"
                  v-model:value="prompt"
                  type="textarea"
                  :placeholder="placeholder"
                  :autosize="{ minRows: 1, maxRows: isMobile ? 4 : 8 }"
                  @input="handleInput"
                  @focus="handleFocus"
                  @blur="handleBlur"
                  @keypress="handleEnter"
                />
              </template>
            </NAutoComplete>
            <NButton type="primary" :disabled="buttonDisabled" @click="handleSubmit">
              <template #icon>
                <span class="dark:text-black">
                  <SvgIcon icon="ri:send-plane-fill" />
                </span>
              </template>
            </NButton>
          </div>
        </div>
      </footer>
    </NLayoutFooter>
  </div>
</template>

<style>
</style>
