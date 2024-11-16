<template>
  <q-btn
    :color="modelValue ? 'positive' : 'grey-7'"
    :icon="modelValue ? 'check_circle' : 'cancel'"
    flat
    round
    dense
    size="sm"
    class="activation-btn"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <q-tooltip>{{ modelValue ? 'Désactiver' : 'Activer' }}</q-tooltip>
  </q-btn>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()
</script>

<style lang="scss" scoped>
.activation-btn {
  min-width: 22px;
  width: 22px;
  height: 22px;
  padding: 0;
  transition: opacity 0.2s ease;

  :deep(.q-icon) {
    font-size: 14px;
  }
  
  &:hover {
    opacity: 0.8;
  }
}

@media (max-width: $breakpoint-xs) {
  .activation-btn {
    min-width: 20px;
    width: 20px;
    height: 20px;

    :deep(.q-icon) {
      font-size: 12px;
    }
  }
}
</style>