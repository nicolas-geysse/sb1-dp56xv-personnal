<template>
  <div class="table-header">
    <q-tr>
      <q-th v-for="col in columns" :key="col.name" :props="props">
        {{ col.label }}
      </q-th>
    </q-tr>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@/types/document'

defineProps<{
  columns: TableColumn[]
}>()
</script>

<style lang="scss" scoped>
.table-header {
  position: sticky;
  top: 0;
  z-index: 2;
  background-color: #1a2634 !important;
  
  :deep(th) {
    color: var(--text-color);
    font-weight: 500;
    padding: 12px 8px;
    border-bottom: 1px solid var(--border-color);
  }
}
</style>