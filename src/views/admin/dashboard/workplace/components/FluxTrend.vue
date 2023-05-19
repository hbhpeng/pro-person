<script lang="ts">
import type { Ref } from 'vue'
import { defineComponent, onMounted, reactive, ref, watch } from 'vue'

import { basicProps } from './props'
import { useECharts } from '@/hooks/useECharts'

export default defineComponent({
  props: basicProps,
  setup(props) {
    const chartRef = ref<HTMLDivElement | null>(null)
    const { setOptions } = useECharts(chartRef as Ref<HTMLDivElement>)
    const defaultOptions: any = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          lineStyle: {
            width: 1,
            color: '#019680',
          },
        },
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: [],
        splitLine: {
          show: true,
          lineStyle: {
            width: 1,
            type: 'solid',
            color: 'rgba(226,226,226,0.5)',
          },
        },
        axisTick: {
          show: false,
        },
      },
      yAxis: [
        {
          type: 'value',
          // max: 80000,
          splitNumber: 4,
          axisTick: {
            show: false,
          },
          splitArea: {
            show: true,
            areaStyle: {
              color: ['rgba(255,255,255,0.2)', 'rgba(226,226,226,0.2)'],
            },
          },
        },
      ],
      grid: { left: '1%', right: '1%', top: '2  %', bottom: 0, containLabel: true },
      series: [
        {
          smooth: true,
          data: [],
          type: 'line',
          areaStyle: {},
          itemStyle: {
            color: '#019680',
          },
        },
      ],
    }

    const options = reactive(defaultOptions)
    const reloadChart = (newData: any) => {
      options.xAxis.data = newData.xAsix as any
      options.series[0].data = newData.yAsix as any
      setOptions(options)
    }

    watch(() => props.chartData, (newData) => {
      reloadChart(newData)
    })

    onMounted(() => {
      reloadChart(props.chartData)
    })
    return { chartRef }
  },

})
</script>

<template>
  <div ref="chartRef" :style="{ height, width }" />
</template>
