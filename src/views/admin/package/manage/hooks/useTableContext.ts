import type { ComputedRef, Ref } from 'vue'
import { inject, provide } from 'vue'
import type { BasicTableProps, TableActionType } from '../types/table'
import type { Nullable } from '@/typings/global'

const key = Symbol('s-table')

type Instance = TableActionType & {
  wrapRef: Ref<Nullable<HTMLElement>>
  getBindValues: ComputedRef<any>
}

type RetInstance = Omit<Instance, 'getBindValues'> & {
  getBindValues: ComputedRef<BasicTableProps>
}

export function createTableContext(instance: Instance) {
  provide(key, instance)
}

export function useTableContext(): RetInstance {
  return inject(key) as RetInstance
}