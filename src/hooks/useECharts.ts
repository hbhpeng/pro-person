import type { EChartsOption } from 'echarts'
import type { Ref } from 'vue'

import { tryOnUnmounted, useDebounceFn } from '@vueuse/core'
import { computed, nextTick, ref, unref, watch } from 'vue'
import { useTimeoutFn } from '@/hooks/core/useTimeout'
import { useEventListener } from '@/hooks/event/useEventListener'
// import { useBreakpoint } from '@/hooks/event/useBreakpoint'

import echarts from '@/utils/echart/echarts'

export function useECharts(
  elRef: Ref<HTMLDivElement>,
  theme: 'light' | 'dark' | 'default' = 'default',
) {
  let chartInstance: echarts.ECharts | null = null
  let resizeFn = resize
  const cacheOptions = ref({})
  let removeResizeFn = () => {}
  resizeFn = useDebounceFn(resize, 200)

  const getOptions = computed((): EChartsOption => {
    return {
      backgroundColor: 'transparent',
      ...cacheOptions.value,
    }
  })

  function initCharts(t = theme) {
    const el = unref(elRef)
    if (!el || !unref(el))
      return

    chartInstance = echarts.init(el, t)
    const { removeEvent } = useEventListener({
      el: window,
      name: 'resize',
      listener: resizeFn,
    })
    removeResizeFn = removeEvent
    // const { widthRef, screenEnum } = useBreakpoint()
    // if (unref(widthRef) <= screenEnum.MD || el.offsetHeight === 0) {
    //   useTimeoutFn(() => {
    //     resizeFn()
    //   }, 30)
    // }
  }

  function setOptions(options: EChartsOption, clear = true) {
    cacheOptions.value = options
    if (unref(elRef)?.offsetHeight === 0) {
      useTimeoutFn(() => {
        setOptions(unref(getOptions))
      }, 30)
      return
    }
    nextTick(() => {
      useTimeoutFn(() => {
        if (!chartInstance) {
          initCharts('default')

          if (!chartInstance)
            return
        }
        clear && chartInstance?.clear()

        chartInstance?.setOption(unref(getOptions))
      }, 30)
    })
  }

  function resize() {
    chartInstance?.resize()
  }

  watch(
    () => { return 'default' },
    (theme) => {
      if (chartInstance) {
        chartInstance.dispose()
        initCharts(theme as 'default')
        setOptions(cacheOptions.value)
      }
    },
  )

  tryOnUnmounted(disposeInstance)

  function getInstance(): echarts.ECharts | null {
    if (!chartInstance)
      initCharts('default')

    return chartInstance
  }

  function disposeInstance() {
    if (!chartInstance)
      return
    removeResizeFn()
    chartInstance.dispose()
    chartInstance = null
  }

  return {
    setOptions,
    resize,
    echarts,
    getInstance,
    disposeInstance,
  }
}
