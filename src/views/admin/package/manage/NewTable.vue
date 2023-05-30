<script setup lang="ts">
import { h } from 'vue'
import { NButton, NDataTable } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

const props = defineProps<Props>()

const emit = defineEmits<Emits>()

// const message = useMessage()

interface Song {
  id: number
  name: string
  wordnum: number
  originprice: number
  nowprice: number
  description: string
  needvip: number
  needStr: string
  reserve: string
  porder: number
}

interface Props {
  proList: Song[]
}

interface Emits {
  (e: 'deleteItem', item: any): void
}

const createColumns = ({
  play,
}: {
  play: (row: Song) => void
}): DataTableColumns<Song> => {
  return [
    {
      title: '套餐名称',
      key: 'name',
    },
    {
      title: '字数',
      key: 'wordnum',
    },
    {
      title: '原价',
      key: 'originprice',
    },
    {
      title: '现价',
      key: 'nowprice',
    },
    {
      title: '排序',
      key: 'porder',
    },
    {
      title: '需要会员',
      key: 'needStr',
    },
    {
      title: '推荐词',
      key: 'reserve',
    },
    {
      title: '描述',
      key: 'description',
    },
    {
      title: '操作',
      key: 'actions',
      render(row) {
        return h(
          NButton,
          {
            strong: true,
            tertiary: true,
            size: 'small',
            onClick: () => play(row),
          },
          { default: () => '删除' },
        )
      },
    },
  ]
}

const columns = createColumns({
  play(row: Song) {
    // message.info(`Play ${row.name}`)
    emit('deleteItem', row)
  },
})
const pagination = { pageSize: 15 } as const
</script>

<template>
  <NDataTable :columns="columns" :data="props.proList" :pagination="pagination" :bordered="false" />
</template>
