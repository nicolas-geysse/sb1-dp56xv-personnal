<template>
  <div class="document-card-wrapper">
    <q-card dark class="document-card">
      <q-card-section>
        <div class="row items-center no-wrap">
          <div class="col">
            <div class="row items-center q-gutter-x-sm">
              <q-checkbox
                :model-value="selected"
                color="primary"
                class="custom-checkbox"
                @update:model-value="$emit('update:selected', $event)"
              />
              <div 
                class="document-name text-primary cursor-pointer"
                @click="$emit('open-drawer', row)"
              >
                {{ row.name }}
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator dark inset />

      <q-card-section>
        <div class="row q-col-gutter-sm">
          <div class="col-12">
            <div class="row items-center justify-between q-gutter-x-sm">
              <div class="text-caption">Activation</div>
              <document-activation-cell
                v-model:value="row.active"
                @update:value="$emit('toggle-activation', row.id)"
              />
            </div>
          </div>

          <div class="col-12">
            <div class="row items-center justify-between">
              <div class="text-caption">Date de création</div>
              <div>{{ formatDate(row.createdAt) }}</div>
            </div>
          </div>

          <div class="col-12">
            <div class="row items-center justify-between">
              <div class="text-caption">Taille</div>
              <div>{{ row.size }} Mo</div>
            </div>
          </div>

          <div class="col-12">
            <div class="row items-center justify-between">
              <div class="text-caption">Pages</div>
              <div>{{ row.pages }}</div>
            </div>
          </div>

          <div class="col-12">
            <div class="row items-center justify-between">
              <div class="text-caption">Tokens</div>
              <div>{{ formatNumber(row.tokens) }}</div>
            </div>
          </div>

          <div class="col-12">
            <div class="row items-center justify-between">
              <div class="text-caption">Indexation</div>
              <document-indexation-cell
                :value="row.indexed"
                :is-indexing="isIndexing"
                :execution-time="row.indexationTime"
                @indexation-complete="onIndexationComplete"
              />
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator dark inset />

      <q-card-actions align="center">
        <document-actions-cell
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
import { defineProps, defineEmits } from 'vue'
import type { Document } from '@/types/document'
import DocumentActivationCell from './cells/DocumentActivationCell.vue'
import DocumentIndexationCell from './cells/DocumentIndexationCell.vue'
import DocumentActionsCell from './cells/DocumentActionsCell.vue'

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

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('fr-FR').format(num)
}

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

  .document-name {
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: calc(100% - 40px);
  }

  .text-caption {
    color: var(--text-secondary);
  }

  .q-card__actions {
    padding: 8px;
    min-height: 52px;
  }
}

:deep(.custom-checkbox) {
  .q-checkbox__inner {
    color: var(--text-color) !important;
    
    &:before {
      border-color: var(--text-color) !important;
    }
  }
  
  &.q-checkbox--checked {
    .q-checkbox__inner {
      color: var(--primary-color) !important;
      
      &:before {
        border-color: var(--primary-color) !important;
      }
    }
  }
}

@media (max-width: $breakpoint-xs) {
  .document-card {
    .document-name {
      font-size: 0.9rem;
    }

    .text-caption {
      font-size: 0.8rem;
    }

    .q-card__section {
      padding: 12px;
    }

    .q-card__actions {
      padding: 8px;
      min-height: 48px;
    }
  }
}
</style>