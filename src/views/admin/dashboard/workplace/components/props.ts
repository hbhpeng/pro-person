import type { PropType } from 'vue'

export interface BasicProps {
  width: string
  height: string
}
export interface ChartOption {
  xAsix: Array<string>
  yAsix: Array<number>
}

export const basicProps = {
  width: {
    type: String as PropType<string>,
    default: '100%',
  },
  height: {
    type: String as PropType<string>,
    default: '280px',
  },
  chartData: {
    type: Object as () => ChartOption,
    default: [],
  },
}
