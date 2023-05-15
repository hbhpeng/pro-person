<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  reactive,
  ref,
  toRaw,
  unref,
} from 'vue'
import { ColumnHeightOutlined, QuestionCircleOutlined, ReloadOutlined } from '@vicons/antd'
// import ColumnSetting from './components/settings/ColumnSetting.vue'
import { NDataTable, NIcon, NSwitch, NTooltip } from 'naive-ui'
import { useLoading } from './hooks/useLoading'
import { useColumns } from './hooks/useColumns'
import { useDataSource } from './hooks/useDataSource'
import { usePagination } from './hooks/usePagination'
import { basicProps } from './props'
import type { BasicTableProps } from './types/table'
import { isBoolean } from '@/utils/is'
import type { Recordable } from '@/typings/global'

const props = defineProps({
  ...basicProps,
})

// const emit = defineEmits([
//   'fetch-success',
//   'fetch-error',
//   'update:checked-row-keys',
//   'edit-end',
//   'edit-cancel',
//   'edit-row-end',
//   'edit-change',
// ])

const densityOptions = [
  {
    type: 'menu',
    label: '紧凑',
    key: 'small',
  },
  {
    type: 'menu',
    label: '默认',
    key: 'medium',
  },
  {
    type: 'menu',
    label: '宽松',
    key: 'large',
  },
]

const deviceHeight = ref(150)
const tableElRef = ref<ComponentRef>(null)
// const wrapRef = ref<Nullable<HTMLDivElement>>(null)
let paginationEl: HTMLElement | null
const isStriped = ref(false)
const tableData = ref<Recordable[]>([])
const innerPropsRef = ref<Partial<BasicTableProps>>()

const getProps = computed(() => {
  return { ...props, ...unref(innerPropsRef) } as BasicTableProps
})

const { getLoading, setLoading } = useLoading(getProps)

const { getPaginationInfo, setPagination } = usePagination(getProps)

const { getDataSourceRef, getRowKey, reload } = useDataSource(
  getProps,
  {
    getPaginationInfo,
    setPagination,
    tableData,
    setLoading,
  },
  (arg0: string, arg1: unknown) => {},
)

const { getPageColumns }
        = useColumns(getProps)

const state = reactive({
  tableSize: unref(getProps as any).size || 'medium',
  isColumnSetting: false,
})

// 页码切换
function updatePage(page: any) {
  setPagination({ page })
  reload()
}

// 分页数量切换
function updatePageSize(size: any) {
  setPagination({ page: 1, pageSize: size })
  reload()
}

// 密度切换
function densitySelect(e: any) {
  state.tableSize = e
}

// 选中行
// function updateCheckedRowKeys(rowKeys) {
//   emit('update:checked-row-keys', rowKeys)
// }

// 获取表格大小
const getTableSize = computed(() => state.tableSize)

// 组装表格信息
const getBindValues = computed(() => {
  const tableData = unref(getDataSourceRef)
  const maxHeight = tableData.length ? `${unref(deviceHeight)}px` : 'auto'
  return {
    ...unref(getProps),
    'loading': unref(getLoading),
    'columns': toRaw(unref(getPageColumns)),
    'rowKey': unref(getRowKey),
    'data': tableData,
    'size': unref(getTableSize),
    'remote': true,
    'max-height': maxHeight,
  }
})

// 获取分页信息
const pagination = computed(() => toRaw(unref(getPaginationInfo)))

// function setProps(props: Partial<BasicTableProps>) {
//   innerPropsRef.value = { ...unref(innerPropsRef), ...props }
// }

const setStriped = (value: boolean) => (isStriped.value = value)

// const tableAction = {
//   reload,
//   setColumns,
//   setLoading,
//   setProps,
//   getColumns,
//   getPageColumns,
//   getCacheColumns,
//   setCacheColumnsField,
//   emit,
// }

const getCanResize = computed(() => {
  const { canResize } = unref(getProps)
  return canResize
})

async function computeTableHeight() {
  const table = unref(tableElRef)
  if (!table)
    return
  if (!unref(getCanResize))
    return
  const tableEl: any = table?.$el
  const headerH = 64
  let paginationH = 2
  const marginH = 24
  if (!isBoolean(unref(pagination))) {
    paginationEl = tableEl.querySelector('.n-data-table__pagination') as HTMLElement
    if (paginationEl) {
      const offsetHeight = paginationEl.offsetHeight
      paginationH += offsetHeight || 0
    }
    else {
      paginationH += 28
    }
  }
  let height
          = (headerH + paginationH + marginH + (props.resizeHeightOffset || 0))
  const maxHeight = props.maxHeight
  // eslint-disable-next-line no-mixed-operators
  height = maxHeight && maxHeight < height ? maxHeight : height
  deviceHeight.value = height
}

onMounted(() => {
  nextTick(() => {
    computeTableHeight()
  })
})

// createTableContext({ ...tableAction, wrapRef, getBindValues })
</script>

<template>
  <div class="table-toolbar">
    <!-- 顶部左侧区域 -->
    <div class="flex items-center table-toolbar-left">
      <template v-if="title">
        <div class="table-toolbar-left-title">
          {{ title }}
          <NTooltip v-if="titleTooltip" trigger="hover">
            <template #trigger>
              <NIcon size="18" class="ml-1 text-gray-400 cursor-pointer">
                <QuestionCircleOutlined />
              </NIcon>
            </template>
            {{ titleTooltip }}
          </NTooltip>
        </div>
      </template>
      <slot name="tableTitle" />
    </div>

    <div class="flex items-center table-toolbar-right">
      <!-- 顶部右侧区域 -->
      <slot name="toolbar" />

      <!-- 斑马纹 -->
      <NTooltip trigger="hover">
        <template #trigger>
          <div class="mr-2 table-toolbar-right-icon">
            <NSwitch v-model:value="isStriped" @update:value="setStriped" />
          </div>
        </template>
        <span>表格斑马纹</span>
      </NTooltip>
      <n-divider vertical />

      <!-- 刷新 -->
      <NTooltip trigger="hover">
        <template #trigger>
          <div class="table-toolbar-right-icon" @click="reload">
            <NIcon size="18">
              <ReloadOutlined />
            </NIcon>
          </div>
        </template>
        <span>刷新</span>
      </NTooltip>

      <!-- 密度 -->
      <NTooltip trigger="hover">
        <template #trigger>
          <div class="table-toolbar-right-icon">
            <n-dropdown
              v-model:value="tableSize"
              trigger="click"
              :options="densityOptions"
              @select="densitySelect"
            >
              <NIcon size="18">
                <ColumnHeightOutlined />
              </NIcon>
            </n-dropdown>
          </div>
        </template>
        <span>密度</span>
      </NTooltip>

      <!-- 表格设置单独抽离成组件 -->
      <ColumnSetting />
    </div>
  </div>
  <div class="s-table">
    <NDataTable
      ref="tableElRef"
      v-bind="getBindValues"
      :striped="isStriped"
      @update:page="updatePage"
      @update:page-size="updatePageSize"
    >
      <template v-for="item in Object.keys($slots)" #[item]="data" :key="item">
        <slot :name="item" v-bind="data" />
      </template>
    </NDataTable>
  </div>
</template>

<style lang="less" scoped>
  .table-toolbar {
    display: flex;
    justify-content: space-between;
    padding: 0 0 16px 0;

    &-left {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      flex: 1;

      &-title {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        font-size: 16px;
        font-weight: 600;
      }
    }

    &-right {
      display: flex;
      justify-content: flex-end;
      flex: 1;

      &-icon {
        margin-left: 12px;
        font-size: 16px;
        cursor: pointer;
        color: var(--text-color);

        :hover {
          color: #1890ff;
        }
      }
    }
  }

  .table-toolbar-inner-popover-title {
    padding: 2px 0;
  }
</style>
