<template>
  <div class="search-wrapper">
    <q-input
      v-model="searchModel"
      dark
      outlined
      dense
      debounce="300"
      label="Rechercher"
      class="search-input"
      bg-color="#374151"
      @update:model-value="onSearchUpdate"
    >
      <template v-slot:append>
        <q-icon name="search" color="primary" />
      </template>
    </q-input>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const searchModel = ref(props.modelValue)

watch(() => props.modelValue, (newValue) => {
  searchModel.value = newValue
})

const onSearchUpdate = (value: string) => {
  emit('update:modelValue', value)
}
</script>

<style lang="scss" scoped>
.search-wrapper {
  width: var(--card-min-width);
}

.search-input {
  :deep(.q-field__control) {
    background-color: #374151;
    border: 1px solid var(--primary-color);
    transition: border-color 0.3s ease;
  }

  :deep(.q-field__label) {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  :deep(.q-field__native) {
    color: var(--text-color);
    padding: 8px 0;
  }

  :deep(.q-field__marginal) {
    height: 40px;
  }
}
</style>