<script setup lang="ts">
import { h } from 'vue'
import { NButton, NDataTable } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

const props = defineProps<Props>()

const emit = defineEmits<Emits>()

const isProxyBuss = import.meta.env.VITE_GLOB_APP_PROXY === 'true'

// const message = useMessage()

interface Song {
  id: number
  nickname: string
  nameid: string
  lastlevel: string
  baseurl: string
  settled: number
  isblack: number
}

interface Props {
  proList: Song[]
}

interface Emits {
  (e: 'blackItem', item: any): void
  (e: 'editItem', item: any): void
  (e: 'showItem', item: any): void
}

const createColumns = (): DataTableColumns<Song> => {
  return [
    {
      title: '代理名称',
      key: 'nickname',
    },
    {
      title: '编码',
      key: 'nameid',
    },
    {
      title: '邀请码',
      key: 'lastlevel',
    },
    {
      title: '网址',
      key: 'baseurl',
    },
    {
      title: '已结算',
      key: 'settled',
    },
    {
      title: '是否被拉黑',
      key: 'isblack',
    },
  ]
}

const editRow = (row: Song) => {
  emit('editItem', row)
}

const blackRow = (row: Song) => {
  emit('blackItem', row)
}

const actionsButton = () => {
  const render = (row: Song) => {
    return h(
      'div',
      [
        h(NButton, {
          strong: true,
          primary: true,
          size: 'small',
          onClick: (event) => {
            event.stopPropagation()
            editRow(row)
          },
        }, { default: () => '编辑' }),
        h(NButton, {
          strong: true,
          tertiary: true,
          size: 'small',
          onClick: (event) => {
            event.stopPropagation()
            blackRow(row)
          },
        }, { default: () => '拉黑' }),
      ],
    )
  }

  return {
    title: '操作',
    key: 'actions',
    render,
  }
}

const columns = createColumns()
if (!isProxyBuss)
  columns.push(actionsButton())

const rowProps = (row: Song) => {
  return {
    style: 'cursor: pointer;',
    onClick: (event: any) => {
      event.stopPropagation()
      emit('showItem', row)
    },
  }
}

const pagination = { pageSize: 15 } as const
</script>

<template>
  <NDataTable :columns="columns" :data="props.proList" :pagination="pagination" :bordered="false" :row-props="rowProps" />
</template>
