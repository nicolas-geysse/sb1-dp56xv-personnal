<template>
  <div class="actions-wrapper">
    <q-btn 
      flat 
      round 
      dense
      size="sm"
      class="action-btn"
      icon="pending_actions" 
      @click="$emit('index', row)"
      :disable="row.indexed"
      :color="row.indexed ? 'grey-7' : ''"
    >
      <q-tooltip>{{ row.indexed ? 'Indexation déjà réalisée' : 'Indexer' }}</q-tooltip>
    </q-btn>
    <q-btn 
      flat 
      round 
      dense
      size="sm"
      class="action-btn"
      icon="settings_suggest" 
      @click="$emit('indexMethod', row)"
    >
      <q-tooltip>Méthode d'indexation</q-tooltip>
    </q-btn>
    <q-btn 
      flat 
      round 
      dense
      size="sm"
      class="action-btn"
      icon="edit" 
      @click="$emit('rename', row)"
    >
      <q-tooltip>Renommer</q-tooltip>
    </q-btn>
    <q-btn 
      flat 
      round 
      dense
      size="sm"
      class="action-btn"
      icon="file_copy" 
      @click="$emit('duplicate', row)"
    >
      <q-tooltip>Dupliquer</q-tooltip>
    </q-btn>
    <q-btn 
      flat 
      round 
      dense
      size="sm"
      class="action-btn"
      icon="download" 
      @click="$emit('download', row)"
    >
      <q-tooltip>Télécharger</q-tooltip>
    </q-btn>
    <q-btn 
      flat 
      round 
      dense
      size="sm"
      color="negative" 
      icon="delete" 
      @click="$emit('delete', row)"
    >
      <q-tooltip>Supprimer</q-tooltip>
    </q-btn>
  </div>
</template>

<script setup lang="ts">
import type { Document } from '@/types/document'

interface Props {
  row: Document
}

defineProps<Props>()

defineEmits<{
  (e: 'index', row: Document): void
  (e: 'indexMethod', row: Document): void
  (e: 'rename', row: Document): void
  (e: 'duplicate', row: Document): void
  (e: 'delete', row: Document): void
  (e: 'download', row: Document): void
}>()
</script>

<style lang="scss" scoped>
.actions-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  
  .q-btn {
    min-width: 24px;
    width: 24px;
    height: 24px;
    padding: 0;
    font-size: 0.8rem;
    transition: transform 0.2s ease;

    :deep(.q-icon) {
      font-size: 16px;
    }
    
    &:hover:not(.q-btn--disabled) {
      transform: scale(1.1);
    }

    &.q-btn--disabled {
      opacity: 0.7;
    }
  }

  .action-btn {
    color: var(--primary-color);

    &.q-btn--disabled {
      color: var(--text-secondary);
    }
  }
}

@media (max-width: 599px) {
  .actions-wrapper {
    gap: 2px;
    
    .q-btn {
      min-width: 20px;
      width: 20px;
      height: 20px;

      :deep(.q-icon) {
        font-size: 14px;
      }
    }
  }
}
</style>