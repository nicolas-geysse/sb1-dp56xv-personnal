<template>
  <div class="drawer-header q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">{{ title }}</div>
      <q-btn
        flat
        round
        dense
        icon="close"
        @click="$emit('close')"
      />
    </div>
    <q-separator dark />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()

defineEmits<{
  (e: 'close'): void
}>()
</script>

<style lang="scss" scoped>
.drawer-header {
  position: sticky;
  top: 0;
  background-color: var(--background-color);
  z-index: 1;

  .text-h6 {
    font-size: 1.25rem;
    font-weight: 500;
  }
}
</style>