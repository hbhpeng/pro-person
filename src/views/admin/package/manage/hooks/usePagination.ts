import type { ComputedRef } from 'vue'
import { computed, ref, unref } from 'vue'
import type { PaginationProps } from '../types/pagination'
import type { BasicTableProps } from '../types/table'

import { DEFAULTPAGESIZE, PAGESIZES } from '../const'
import { isBoolean } from '@/utils/is'

export function usePagination(refProps: ComputedRef<BasicTableProps>) {
  const configRef = ref<PaginationProps>({})
  const show = ref(true)

  const getPaginationInfo = computed((): PaginationProps | boolean => {
    const { pagination } = unref(refProps)
    if (!unref(show) || (isBoolean(pagination) && !pagination))
      return false

    // const { totalField } = APISETTING
    return {
      pageSize: DEFAULTPAGESIZE,
      pageSizes: PAGESIZES,
      showSizePicker: true,
      showQuickJumper: true,
      ...(isBoolean(pagination) ? {} : pagination),
      ...unref(configRef),
      // pageCount: unref(configRef)[totalField],
    }
  })

  function setPagination(info: Partial<PaginationProps>) {
    const paginationInfo = unref(getPaginationInfo)
    configRef.value = {
      ...(!isBoolean(paginationInfo) ? paginationInfo : {}),
      ...info,
    }
  }

  function getPagination() {
    return unref(getPaginationInfo)
  }

  function getShowPagination() {
    return unref(show)
  }

  async function setShowPagination(flag: boolean) {
    show.value = flag
  }

  return { getPagination, getPaginationInfo, setShowPagination, getShowPagination, setPagination }
}
