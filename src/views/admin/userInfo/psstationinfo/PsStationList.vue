<script setup lang="ts">
import { h } from 'vue'
import { NButton, NDataTable } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

const props = defineProps<Props>()

const emit = defineEmits<Emits>()

// const message = useMessage()

interface Song {
  id: number
  authcode: string
  nickname: string
  weburl: string
  reverse: string
  openaikey: string
}

interface Props {
  proList: Song[]
}

interface Emits {
  (e: 'deleteItem', item: any): void
  (e: 'editItem', item: any): void
}

const createColumns = (): DataTableColumns<Song> => {
  return [
    {
      title: '授权码',
      key: 'authcode',
    },
    {
      title: '昵称',
      key: 'nickname',
    },
    {
      title: '个人站地址',
      key: 'weburl',
    },
    {
      title: 'openaikey',
      key: 'openaikey',
    },
  ]
}

const editRow = (row: Song) => {
  emit('editItem', row)
}

const blackRow = (row: Song) => {
  emit('deleteItem', row)
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
        }, { default: () => '删除' }),
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
columns.push(actionsButton())

const pagination = { pageSize: 15 } as const
</script>

<template>
  <NDataTable :columns="columns" :data="props.proList" :pagination="pagination" :bordered="false" />
</template>
