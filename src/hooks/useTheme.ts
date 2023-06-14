import type { GlobalThemeOverrides } from 'naive-ui'
import { computed, watch } from 'vue'
import { darkTheme, useOsTheme } from 'naive-ui'
import { useAppStore } from '@/store'

export function useTheme() {
  const appStore = useAppStore()

  const OsTheme = useOsTheme()

  const isDark = computed(() => {
    if (appStore.theme === 'auto')
      return OsTheme.value === 'dark'
    else
      return appStore.theme === 'dark'
  })

  const theme = computed(() => {
    return isDark.value ? darkTheme : undefined
  })

  const themeOverrides = computed<GlobalThemeOverrides>(() => {
    return {
      common: {
        primaryColor: '#6AA1E7',
        primaryColorHover: '#6AA1E7',
        primaryColorPressed: '#6AA1E7',
        textColor: '#6AA1E7',
      },
      Button: {
        color: '#FFFFFF',
        colorPrimary: '#6AA1E7',
        colorDisabledPrimary: '#6AA1E7',
        colorFocusPrimary: '#6AA1E7',
        textColorTextPrimary: '#6AA1E7',
      },
      Pagination: {
        itemTextColorActive: '#6AA1E7',
        itemBorderActive: '1px solid #6AA1E7',
      },
      Slider: {
        fillColor: '#6AA1E7',
        fillColorHover: '#6AA1E7',
      },
      Tabs: {
        tabTextColorActiveLine: '#6AA1E7',
        tabTextColorHoverLine: '#6AA1E7',
        barColor: '#6AA1E7',
      },
      Menu: {
        itemTextColor: '#000000',
        itemIconColor: '#000000',
        arrowColor: '#000000',
        itemIconColorCollapsed: '#000000',
      },
    }
  })

  watch(
    () => isDark.value,
    (dark) => {
      if (dark)
        document.documentElement.classList.add('dark')
      else
        document.documentElement.classList.remove('dark')
    },
    { immediate: true },
  )

  return { theme, themeOverrides }
}
