<template>
  <q-dialog
    v-model="modelValue"
    :persistent="persistent"
    class="custom-dialog"
  >
    <q-card dark style="min-width: 375px">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ title }}</div>
      </q-card-section>

      <q-card-section>
        <slot></slot>
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-pb-md">
        <template v-for="action in actions" :key="action.label">
          <q-btn v-bind="action" />
        </template>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface DialogAction {
  label: string
  color?: string
  flat?: boolean
  disable?: boolean
  onClick?: () => void
}

interface Props {
  modelValue: boolean
  title: string
  persistent?: boolean
  actions: DialogAction[]
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
.q-card {
  background-color: var(--background-color);
}

.text-h6 {
  color: var(--text-color);
  font-size: 1.25rem;
  font-weight: 500;
}

.q-card-actions {
  .q-btn {
    min-width: 100px;
  }
}
</style>