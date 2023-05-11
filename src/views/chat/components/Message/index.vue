<script setup lang='ts'>
import {
  computed,
  ref,
} from 'vue'
import {
  NDropdown,
} from 'naive-ui'
import MarkdownIt from 'markdown-it'
import ExcelJS from 'exceljs'
import AvatarComponent from './Avatar.vue'
import TextComponent from './Text.vue'
import {
  SvgIcon,
} from '@/components/common'
import {
  appendCopyText,
  copyText,
} from '@/utils/format'
import {
  useIconRender,
} from '@/hooks/useIconRender'
import {
  t,
} from '@/locales'
import {
  useBasicLayout,
} from '@/hooks/useBasicLayout'

interface Props {
  dateTime?: string
  text?: string
  inversion?: boolean
  error?: boolean
  loading?: boolean
}

interface Emit {
  (ev: 'regenerate'): void
  (ev: 'delete'): void
}

const props = defineProps < Props > ()

const emit = defineEmits < Emit > ()

const {
  isMobile,
} = useBasicLayout()

const {
  iconRender,
} = useIconRender()

const textRef = ref < HTMLElement > ()

const asRawText = ref(props.inversion)

const messageRef = ref < HTMLElement > ()

const options = computed(() => {
  const common = [{
    label: t('chat.copy'),
    key: 'copyText',
    icon: iconRender({
      icon: 'ri:file-copy-2-line',
    }),
  },
  {
    label: '追加复制',
    key: 'appendCopyText',
    icon: iconRender({
      icon: 'ri:file-copy-2-line',
    }),
  },
  {
    label: t('common.delete'),
    key: 'delete',
    icon: iconRender({
      icon: 'ri:delete-bin-line',
    }),
  },
  ]

  if (!props.inversion) {
    common.unshift({
      label: asRawText.value ? t('chat.preview') : t('chat.showRawText'),
      key: 'toggleRenderType',
      icon: iconRender({
        icon: asRawText.value ? 'ic:outline-code-off' : 'ic:outline-code',
      }),
    })
  }

  if (isHaveTableContent()) {
    common.push({
      label: '导出excel',
      key: 'exportExcelType',
      icon: iconRender({
        icon: 'ph:export',
      }),
    })
  }

  return common
})

function isHaveTableContent() {
  const regex = /\s*\|.*\|\s*\n\s*\|.*\|\s*\n/
  const matches = props.text?.match(regex)
  if (matches)
    return true
  return false
}

function parseTableNextState(state: 'begin' | 'thead' | 'tbody' | 'end') {
  switch (state) {
    case 'begin':
      return 'thead'
    case 'thead':
      return 'tbody'
    case 'tbody':
      return 'end'
    default:
      return 'end'
  }
}

function exportTableToExcel() {
  const mdi = new MarkdownIt()
  const tokens = mdi.parse(props.text ?? '', {})
  const headArray = []
  const bodyArray = []
  let currentState: 'begin' | 'thead' | 'tbody' | 'end' = 'begin'
  let currentBodyRow: any[] = []
  for (const token of tokens) {
    if (currentState === 'begin' && token.type === 'thead_open') {
      currentState = parseTableNextState(currentState)
    }
    else if (currentState === 'thead' && token.type === 'inline') {
      // 解析 head
      headArray.push({
        header: token.content,
        key: `key${headArray.length}`,
        width: 20,
      })
    }
    else if (currentState === 'thead' && token.type === 'tbody_open') {
      currentState = parseTableNextState(currentState)
    }
    else if (currentState === 'tbody' && token.type === 'tr_open') {
      // 解析 body
      currentBodyRow = []
      bodyArray.push(currentBodyRow)
    }
    else if (currentState === 'tbody' && token.type === 'inline') {
      // 解析body row
      currentBodyRow.push(token.content)
    }
    else if (token.type === 'table_close') {
      currentState = 'end'
      break
    }
  }
  const bodySheetArray = []
  for (const body of bodyArray) {
    const bodyRow = {}
    body.forEach((value, index) => {
      bodyRow[`key${index}`] = value
    })
    bodySheetArray.push(bodyRow)
  }
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Sheet1')
  worksheet.columns = headArray as any
  worksheet.addRows(bodySheetArray)
  workbook.xlsx.writeBuffer().then((buffer) => {
    // 下载文件
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'table.xlsx'
    document.body.appendChild(link)
    link.click()
    URL.revokeObjectURL(url)
    document.body.removeChild(link)
  })
}

function handleSelect(key: 'copyText' | 'appendCopyText' | 'delete' | 'toggleRenderType' | 'exportExcelType') {
  switch (key) {
    case 'copyText':
      copyText({
        text: props.text ?? '',
      })
      return
    case 'toggleRenderType':
      asRawText.value = !asRawText.value
      return
    case 'appendCopyText':
      appendCopyText({
        text: props.text ?? '',
      })
      return
    case 'exportExcelType':
      exportTableToExcel()
      return
    case 'delete':
      emit('delete')
  }
}

function handleRegenerate() {
  messageRef.value?.scrollIntoView()
  emit('regenerate')
}
</script>

<template>
  <div ref="messageRef" class="flex w-full mb-6 overflow-hidden" :class="[{ 'flex-row-reverse': inversion }]">
    <div
      class="flex items-center justify-center flex-shrink-0 h-8 overflow-hidden rounded-full basis-8"
      :class="[inversion ? 'ml-2' : 'mr-2']"
    >
      <AvatarComponent :image="inversion" />
    </div>
    <div class="overflow-hidden text-sm " :class="[inversion ? 'items-end' : 'items-start']">
      <p class="text-xs text-[#b4bbc4]" :class="[inversion ? 'text-right' : 'text-left']">
        {{ dateTime }}
      </p>
      <div class="flex items-end gap-1 mt-2" :class="[inversion ? 'flex-row-reverse' : 'flex-row']">
        <TextComponent
          ref="textRef" :inversion="inversion" :error="error" :text="text" :loading="loading"
          :as-raw-text="asRawText"
        />
        <div class="flex flex-col">
          <button
            v-if="!inversion"
            class="mb-2 transition text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-300"
            @click="handleRegenerate"
          >
            <SvgIcon icon="ri:restart-line" />
          </button>
          <NDropdown
            :trigger="isMobile ? 'click' : 'hover'" :placement="!inversion ? 'right' : 'left'"
            :options="options" @select="handleSelect"
          >
            <button class="transition text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-200">
              <SvgIcon icon="ri:more-2-fill" />
            </button>
          </NDropdown>
        </div>
      </div>
    </div>
  </div>
</template>
