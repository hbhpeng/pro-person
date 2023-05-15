import type { ComputedRef } from 'vue'
import { computed, onMounted, ref, unref, watch, watchEffect } from 'vue'
import type { BasicTableProps } from '../types/table'
import type { PaginationProps } from '../types/pagination'
import { APISETTING } from '../const'
import { isBoolean, isFunction } from '@/utils/is'
import type { Recordable } from '@/typings/global'

export function useDataSource(
  propsRef: ComputedRef<BasicTableProps>,
  { getPaginationInfo, setPagination, tableData }: any,
  emit: (arg0: string, arg1: unknown) => void,
) {
  const dataSourceRef = ref<Recordable[]>([])

  watchEffect(() => {
    tableData.value = unref(dataSourceRef)
  })

  watch(
    () => unref(propsRef).dataSource,
    () => {
      const { dataSource }: any = unref(propsRef)
      dataSource && (dataSourceRef.value = dataSource)
    },
    {
      immediate: true,
    },
  )

  const getRowKey = computed(() => {
    const { rowKey }: any = unref(propsRef)
    return rowKey || (() => {
      return 'key'
    })
  })

  const getDataSourceRef = computed(() => {
    const dataSource = unref(dataSourceRef)
    if (!dataSource || dataSource.length === 0)
      return unref(dataSourceRef)

    return unref(dataSourceRef)
  })

  async function fetch(opt?: { [x: string]: any } | undefined) {
    try {
      // setLoading(true)
      const { request, pagination, beforeRequest, afterRequest }: any = unref(propsRef)
      if (!request)
        return
      // 组装分页信息
      const pageField = APISETTING.pageField
      const sizeField = APISETTING.sizeField
      const totalField = APISETTING.totalField
      const listField = APISETTING.listField

      let pageParams = { pageField, sizeField }
      const { page = 1, pageSize = 10 } = unref(getPaginationInfo) as PaginationProps

      if ((isBoolean(pagination) && !pagination) || isBoolean(getPaginationInfo)) {
        pageParams = { pageField, sizeField }
      }
      else {
        pageParams.pageField = (opt && opt[pageField]) || page
        pageParams.sizeField = pageSize.toString()
      }

      let params = {
        ...pageParams,
      }
      if (beforeRequest && isFunction(beforeRequest)) {
        // The params parameter can be modified by outsiders
        params = (await beforeRequest(params)) || params
      }
      const res = await request(params)

      const resultTotal = res[totalField] || 0
      const currentPage = res[pageField]

      // 如果数据异常，需获取正确的页码再次执行
      if (resultTotal) {
        if (page > resultTotal) {
          setPagination({
            [pageField]: resultTotal,
          })
          fetch(opt)
        }
      }
      let resultInfo = res[listField] ? res[listField] : []
      if (afterRequest && isFunction(afterRequest)) {
        // can modify the data returned by the interface for processing
        resultInfo = (await afterRequest(resultInfo)) || resultInfo
      }
      dataSourceRef.value = resultInfo
      pagination({
        [pageField]: currentPage,
        [totalField]: resultTotal,
      })
      if (opt && opt[pageField]) {
        pagination({
          [pageField]: opt[pageField] || 1,
        })
      }
      emit('fetch-success', {
        items: unref(resultInfo),
        resultTotal,
      })
    }
    catch (error) {
      console.error(error)
      emit('fetch-error', error)
      dataSourceRef.value = []
      // setPagination({
      //   pageCount: 0,
      // });
    }
    finally {
      // setLoading(false)
    }
  }

  onMounted(() => {
    setTimeout(() => {
      fetch()
    }, 16)
  })

  function setTableData(values: Recordable<any>[]) {
    dataSourceRef.value = values
  }

  function getDataSource(): any[] {
    return getDataSourceRef.value
  }

  async function reload(opt?: any) {
    await fetch(opt)
  }

  return {
    fetch,
    getRowKey,
    getDataSourceRef,
    getDataSource,
    setTableData,
    reload,
  }
}
