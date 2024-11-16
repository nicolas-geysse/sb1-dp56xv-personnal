<template>
  <section class="metadata-section">
    <div class="text-subtitle2 q-mb-sm">Informations</div>
    <div class="row q-col-gutter-md">
      <metadata-field
        label="Créé le"
        :value="formatDate(document.createdAt)"
        class="col-6"
      />
      <metadata-field
        label="Taille"
        :value="`${document.size} Mo`"
        class="col-6"
      />
      <metadata-field
        label="Pages"
        :value="document.pages.toString()"
        class="col-6"
      />
      <metadata-field
        label="Tokens"
        :value="formatNumber(document.tokens)"
        class="col-6"
      />
      <metadata-field
        label="Statut d'indexation"
        class="col-12"
      >
        <document-indexation-cell 
          :value="document.indexed"
          :execution-time="document.indexationTime"
        />
      </metadata-field>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Document } from '@/types/document'
import MetadataField from './MetadataField.vue'
import DocumentIndexationCell from '../../cells/DocumentIndexationCell.vue'

defineProps<{
  document: Document
}>()

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('fr-FR').format(num)
}
</script>