<template>
  <q-chip 
    :color="statusColor"
    text-color="white"
    size="sm"
    class="status-chip"
  >
    {{ value }}
  </q-chip>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TableStatus } from '@/types/table'

const props = defineProps<{
  value: TableStatus
}>()

const statusColor = computed(() => {
  const colors: Record<TableStatus, string> = {
    'Actif': 'positive',
    'En attente': 'warning',
    'Inactif': 'negative'
  }
  return colors[props.value] || 'grey'
})
</script>

<style lang="scss" scoped>
.status-chip {
  min-width: 80px;
  text-align: center;
  font-weight: 500;
  
  &.q-chip--colored {
    opacity: 0.9;
    
    &:hover {
      opacity: 1;
    }
  }
}

@media (max-width: 599px) {
  .status-chip {
    min-width: 70px;
    font-size: 0.8rem;
  }
}
</style>