<template>
  <q-drawer
    v-model="modelValue"
    side="right"
    bordered
    :width="width"
    :breakpoint="breakpoint"
    dark
    class="base-drawer"
  >
    <slot></slot>
  </q-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: boolean
  width?: number
  breakpoint?: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const modelValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>

<style lang="scss" scoped>
.base-drawer {
  background-color: var(--background-color);
}
</style>