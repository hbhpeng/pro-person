<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  NAutoComplete, NButton, NInput, NLayout, NLayoutFooter, NLayoutHeader,
  NLayoutSider, NMenu, NSpace,
} from 'naive-ui'

import { useRoute } from 'vue-router'
import { useUsingContext } from '../chat/hooks/useUsingContext'
import HeaderComponent from '../chat/components/Header/index.vue'
import { Message } from '../chat/components'
import { useChat } from '../chat/hooks/useChat'
import { useScroll } from '../chat/hooks/useScroll'
import List from '../chat/layout/sider/List.vue'
import MenuCofig from './menu/config'

import { useBasicLayout } from '@/hooks/useBasicLayout'
import { HoverButton, SvgIcon } from '@/components/common'
import { useChatStore } from '@/store'
import { askFileQuestion, fetchChatAPIProcess, getPromotImage } from '@/api'
import { t } from '@/locales'
import { getQAFileName } from '@/store/modules/chat/helper'

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
const chatStore = useChatStore()
const route = useRoute()
let controller = new AbortController()
const loading = ref<boolean>(false)
const dialog = useDialog()

const openLongReply = import.meta.env.VITE_GLOB_OPEN_LONG_REPLY === 'true'

const { updateChat, updateChatSome } = useChat()

const { uuid } = route.params as { uuid: string; fileType: string }

const dataSources = computed(() => chatStore.getChatByUuid(+uuid))

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

  updateChat(
    +uuid,
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
            updateChat(
              +uuid,
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
      updateChatSome(+uuid, index, { loading: false })
    }
    await fetchChatAPIOnce()
  }
  catch (error: any) {
    if (error.message === 'canceled') {
      updateChatSome(
        +uuid,
        index,
        {
          loading: false,
        },
      )
      return
    }

    const errorMessage = error?.message ?? t('common.wrong')

    updateChat(
      +uuid,
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
      chatStore.deleteChatByUuid(+uuid, index)
    },
  })
}

/// /////footer event
const ms = useMessage()
const { addChat, getChatByUuidAndIndex } = useChat()
const conversationList = computed(() => dataSources.value.filter(item => (!item.inversion && !!item.conversationOptions)))
const { scrollToBottom, scrollToBottomIfAtBottom } = useScroll()

const prompt = ref<string>('')
const isFile = ref(false)

const buttonDisabled = computed(() => {
  return loading.value || !prompt.value || prompt.value.trim() === ''
})

function handleSubmit() {
  if (isFile.value && !getQAFileName()) {
    ms.error('请先上传文件')
    return
  }
  onConversation()
}

async function onConversation() {
  let message = prompt.value

  if (loading.value)
    return

  if (!message || message.trim() === '')
    return

  controller = new AbortController()

  addChat(
    +uuid,
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

  addChat(
    +uuid,
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

  async function checkIfAskFile() {
    if (isFile.value) {
      const { data } = await askFileQuestion(message, controller.signal)
      const content = JSON.parse(data as any).message
      updateChatSome(
        +uuid,
        dataSources.value.length - 1, {
          dateTime: new Date().toLocaleString(),
          text: content,
          inversion: false,
          error: false,
          loading: false,
        },
      )
      return true
    }
    return false
  }

  // 是否要求发送图片
  async function checkIfImage() {
    if (message.indexOf('[img]') === 0) {
      const {
        data,
      } = await getPromotImage(message.substring(5, message.length), controller.signal)
      const imageContent: string = JSON.parse(data as string).content
      updateChatSome(
        +uuid,
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
    // 问文件
    if (await checkIfAskFile())
      return
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
            updateChat(
              +uuid,
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
      updateChatSome(+uuid, dataSources.value.length - 1, { loading: false })
    }

    await fetchChatAPIOnce()
  }
  catch (error: any) {
    const errorMessage = error?.message ?? t('common.wrong')

    if (error.message === 'canceled') {
      updateChatSome(
        +uuid,
        dataSources.value.length - 1,
        {
          loading: false,
        },
      )
      scrollToBottomIfAtBottom()
      return
    }

    const currentChat = getChatByUuidAndIndex(+uuid, dataSources.value.length - 1)

    if (currentChat?.text && currentChat.text !== '') {
      updateChatSome(
        +uuid,
        dataSources.value.length - 1,
        {
          text: `${currentChat.text}\n[${errorMessage}]`,
          error: false,
          loading: false,
        },
      )
      return
    }

    updateChat(
      +uuid,
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

const receiveMessage = (content: string) => {
  addChat(
    +uuid,
    {
      dateTime: new Date().toLocaleString(),
      text: content,
      inversion: false,
      error: false,
      conversationOptions: null,
      requestOptions: { prompt: content, options: null },
    },
  )
  scrollToBottom()
}

function handleStop() {
  if (loading.value) {
    controller.abort()
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col justify-between w-full h-full">
    <header>
      <NLayoutHeader :inverted="inverted" bordered>
        <HeaderComponent
          v-if="isMobile ? true : true"
          :using-context="usingContext"
          @export="handleExport"
          @toggle-using-context="toggleUsingContext"
        />
      </NLayoutHeader>
    </header>
    <NSpace justify="space-between">
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
          />
        </NLayoutSider>

        <NLayout>
          <main class="flex-1 overflow-hidden">
            <div id="scrollRef" ref="scrollRef" class="h-full overflow-hidden overflow-y-auto">
              <div
                id="image-wrapper"
                class="w-full max-w-screen-xl m-auto dark:bg-[#101014]"
                :class="[isMobile ? 'p-2' : 'p-4']"
              >
                <template v-if="isFile">
                  <Upload @receive-message="receiveMessage" />
                </template>
                <template v-if="!dataSources.length && !isFile">
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
        </NLayout>
      </NLayout>
      <NLayout has-sider sider-placement="right" bordered>
        <NLayoutSider
          bordered
          show-trigger
          collapse-mode="width"
          :collapsed-width="30"
          :width="200"
          :native-scrollbar="false"
          style="max-height: 320px"
        >
          <div class="flex-1 min-h-0 pb-4 overflow-hidden">
            <List />
          </div>
        </NLayoutSider>
      </NLayout>
    </NSpace>
    <footer>
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
              <NAutoComplete>
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
    </footer>
  </div>
</template>

<style>
</style>
