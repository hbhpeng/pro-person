import { h } from 'vue'
import { NAvatar } from 'naive-ui'

export const columns = [
  {
    title: 'id',
    key: 'id',
    width: 100,
  },
  {
    title: '套餐名称',
    key: 'name',
    width: 100,
  },
  {
    title: '字数',
    key: 'name',
    width: 100,
  },
  {
    title: '原价',
    key: 'avatar',
    width: 100,
    render(row: { avatar: any }) {
      return h(NAvatar, {
        size: 48,
        src: row.avatar,
      })
    },
  },
  {
    title: '现价',
    key: 'address',
    auth: ['basic_list'], // 同时根据权限控制是否显示
    ifShow: (_column: any) => {
      return true // 根据业务控制是否显示
    },
    width: 150,
  },
  {
    title: '创建时间',
    key: 'date',
    width: 100,
  },
]
