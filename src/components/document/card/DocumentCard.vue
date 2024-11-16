<template>
  <div class="document-card-wrapper">
    <q-card dark class="document-card">
      <!-- Header Section -->
      <document-card-header
        :name="row.name"
        :selected="selected"
        @update:selected="$emit('update:selected', $event)"
        @open-drawer="$emit('open-drawer', row)"
      />

      <q-separator dark inset />

      <!-- Content Section -->
      <document-card-content
        :document="row"
        :is-indexing="isIndexing"
        @toggle-activation="$emit('toggle-activation', row.id)"
        @indexation-complete="onIndexationComplete"
      />

      <q-separator dark inset />

      <!-- Actions Section -->
      <q-card-actions align="center">
        <document-card-actions
          :row="row"
          @index="$emit('index', row)"
          @index-method="$emit('index-method', row)"
          @rename="$emit('rename', row)"
          @duplicate="$emit('duplicate', row)"
          @delete="$emit('delete', row)"
          @download="$emit('download', row)"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import type { Document } from '@/types/document'
import DocumentCardHeader from './DocumentCardHeader.vue'
import DocumentCardContent from './DocumentCardContent.vue'
import DocumentCardActions from './DocumentCardActions.vue'

interface Props {
  row: Document
  selected: boolean
  isIndexing: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'index', doc: Document): void
  (e: 'index-method', doc: Document): void
  (e: 'rename', doc: Document): void
  (e: 'duplicate', doc: Document): void
  (e: 'delete', doc: Document): void
  (e: 'download', doc: Document): void
  (e: 'toggle-activation', id: number): void
  (e: 'open-drawer', doc: Document): void
  (e: 'update:selected', value: boolean): void
  (e: 'indexation-complete', time: number): void
}>()

const onIndexationComplete = (time: number) => {
  emit('indexation-complete', time)
}
</script>

<style lang="scss" scoped>
.document-card-wrapper {
  width: var(--card-min-width);
  flex: 0 0 var(--card-min-width);
  padding: 8px;
}

.document-card {
  background-color: var(--background-color);
  border: 1px solid var(--border-color);
  height: 100%;

  .q-card__actions {
    padding: 8px;
    min-height: 52px;
  }
}

@media (max-width: $breakpoint-xs) {
  .document-card {
    .q-card__actions {
      padding: 8px;
      min-height: 48px;
    }
  }
}
</style>