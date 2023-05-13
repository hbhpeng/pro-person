import { h } from 'vue'
import { SvgIcon } from '@/components/common'

export function getCurrentDate() {
  const date = new Date()
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  return `${year}-${month}-${day}`
}

/**
 * render 图标
 * */
export function renderIcon(icon: string) {
  return () => h(SvgIcon, { icon })
}
