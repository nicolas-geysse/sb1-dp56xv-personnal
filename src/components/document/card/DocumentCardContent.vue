<template>
  <q-card-section>
    <div class="row q-col-gutter-sm">
      <document-card-field
        label="Activation"
        class="col-12"
      >
        <document-activation-cell
          v-model:value="document.active"
          @update:value="$emit('toggle-activation')"
        />
      </document-card-field>

      <document-card-field
        label="Date de création"
        :value="formatDate(document.createdAt)"
        class="col-12"
      />

      <document-card-field
        label="Taille"
        :value="`${document.size} Mo`"
        class="col-12"
      />

      <document-card-field
        label="Pages"
        :value="document.pages.toString()"
        class="col-12"
      />

      <document-card-field
        label="Tokens"
        :value="formatNumber(document.tokens)"
        class="col-12"
      />

      <document-card-field
        label="Indexation"
        class="col-12"
      >
        <document-indexation-cell
          :value="document.indexed"
          :is-indexing="isIndexing"
          :execution-time="document.indexationTime"
          @indexation-complete="onIndexationComplete"
        />
      </document-card-field>
    </div>
  </q-card-section>
</template>

<script setup lang="ts">
import type { Document } from '@/types/document'
import DocumentCardField from './DocumentCardField.vue'
import DocumentActivationCell from '../cells/DocumentActivationCell.vue'
import DocumentIndexationCell from '../cells/DocumentIndexationCell.vue'

interface Props {
  document: Document
  isIndexing: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'toggle-activation'): void
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