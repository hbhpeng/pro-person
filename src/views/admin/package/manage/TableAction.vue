<script setup lang="ts">
import type { PropType } from 'vue'
import { computed, toRaw } from 'vue'
import { NDropdown } from 'naive-ui'
import { string } from 'vue-types'
// import type { ActionItem } from '../types/talb'

const props = defineProps({
  actions: {
    type: Array,
    default: null,
    required: true,
  },
  dropDownActions: {
    type: Array,
    default: null,
  },
  style: {
    type: String as PropType<String>,
    default: 'button',
  },
  select: {
    type: Function as PropType<Function>,
    default: () => {},
  },
})
const actionType
        = props.style === 'button' ? 'default' : props.style === 'text' ? 'primary' : 'default'
const actionText
        = props.style === 'button' ? undefined : props.style === 'text' ? true : undefined

// const getMoreProps = computed(() => {
//   return {
//     text: actionText,
//     type: actionType,
//     size: 'small',
//   }
// })

const getDropdownList = computed(() => {
  return (toRaw(props.dropDownActions) || [])
    .filter(() => {
      return true
    })
    .map((action) => {
      return {
        size: 'small',
        text: actionText,
        type: actionType,
      }
    })
})

// function isIfShow(action: ActionItem): boolean {
//   const ifShow = action.ifShow

//   let isIfShow = true

//   if (isBoolean(ifShow))
//     isIfShow = ifShow

//   if (isFunction(ifShow))
//     isIfShow = ifShow(action)

//   return isIfShow
// }

const getActions = computed(() => {
  return (toRaw(props.actions) || [])
    .filter(() => {
      return true
    })
    .map((action) => {
      return {
        size: 'small',
        text: actionText,
        type: actionType,
        label: string,
        icon: string,
      }
    })
})
</script>

<template>
  <div class="tableAction">
    <div class="flex items-center justify-center">
      <template v-for="(action) in getActions" :key="`${index}-${action.label}`">
        <NButton class="mx-2">
          {{ action.label }}
          <template v-if="action.hasOwnProperty('icon')" #icon>
            <NIcon :component="action.icon" />
          </template>
        </NButton>
      </template>
      <NDropdown
        v-if="dropDownActions && getDropdownList.length"
        trigger="hover"
        :options="getDropdownList"
      >
        <slot name="more" />
      </NDropdown>
    </div>
  </div>
</template>
