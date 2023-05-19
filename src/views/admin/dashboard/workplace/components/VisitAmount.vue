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
    const defaultOptions = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          lineStyle: {
            width: 1,
            color: '#019680',
          },
        },
      },
      grid: { left: '1%', right: '1%', top: '2  %', bottom: 0, containLabel: true },
      xAxis: {
        type: 'category',
        data: [],
      },
      yAxis: {
        type: 'value',
        // max: 8000,
        splitNumber: 4,
      },
      series: [
        {
          data: [],
          type: 'bar',
          barMaxWidth: 80,
        },
      ],
    }
    const options = reactive(defaultOptions)
    const reloadChart = (newData: any) => {
      options.xAxis.data = newData.xAsix as any
      options.series[0].data = newData.yAsix as any
      setOptions(options as any)
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
