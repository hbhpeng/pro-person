<script setup lang="ts">
import { h } from 'vue'
import { NButton, NDataTable, useMessage } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

const message = useMessage()

interface Song {
  id: number
  name: string
  wordNum: number
  orginPrice: number
  nowPrice: number
  description: string
}

const createColumns = ({
  play,
}: {
  play: (row: Song) => void
}): DataTableColumns<Song> => {
  return [
    {
      title: 'id',
      key: 'id',
    },
    {
      title: '套餐名称',
      key: 'name',
    },
    {
      title: '字数',
      key: 'wordNum',
    },
    {
      title: '原价',
      key: 'orginPrice',
    },
    {
      title: '现价',
      key: 'nowPrice',
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

const data: Song[] = [
  { id: 3, name: '周会员', wordNum: 12323, orginPrice: 12, nowPrice: 35.3, description: '死定了开发商两地分居的基辅罗斯大嫁风尚水电费水电费乐山大佛乐山大佛进水了的开发惊世毒妃\r\n双丰收了' },
  { id: 3, name: '周会员', wordNum: 12343, orginPrice: 12, nowPrice: 35, description: 'sdfs' },
  { id: 3, name: '周会员', wordNum: 35353, orginPrice: 12, nowPrice: 35, description: 'sdfs' },
]

const columns = createColumns({
  play(row: Song) {
    message.info(`Play ${row.name}`)
  },
})
const pagination = false as const
</script>

<template>
  <NDataTable
    :columns="columns"
    :data="data"
    :pagination="pagination"
    :bordered="false"
  />
</template>
