<template>
  <div class="q-pa-md">
    <table-toolbar 
      v-model:filter="filter"
      :selected-count="selectedDocuments.length"
      :is-mobile="shouldShowCards"
      @add="onAdd"
      @index-selected="onIndexSelected"
      @duplicate-selected="onDuplicateSelected"
      @download-selected="onDownloadSelected"
      @delete-selected="onDeleteSelected"
    />

    <!-- Desktop view -->
    <div v-if="!shouldShowCards" class="q-mt-md">
      <q-table
        :rows="sortedAndFilteredDocuments"
        :columns="columns"
        row-key="id"
        :filter="filter"
        :loading="loading"
        dark
        flat
        bordered
        :pagination="pagination"
        :rows-per-page-options="rowsPerPageOptions"
        selection="multiple"
        v-model:selected="selectedDocuments"
        @request="onRequest"
        class="my-sticky-header-table"
        virtual-scroll
        :virtual-scroll-slice-size="10"
        :virtual-scroll-slice-ratio-before="0.3"
        :virtual-scroll-slice-ratio-after="0.3"
        :virtual-scroll-item-size="48"
      >
        <template v-slot:body-cell-name="props">
          <q-td :props="props">
            <div 
              class="text-primary cursor-pointer"
              @click="toggleDrawer(props.row)"
            >
              {{ props.row.name }}
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-active="props">
          <q-td :props="props" class="text-center">
            <activation-cell
              v-model:value="props.row.active"
              @update:value="toggleActivation(props.row.id)"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-createdAt="props">
          <q-td :props="props" class="text-center">
            {{ formatDate(props.row.createdAt) }}
          </q-td>
        </template>

        <template v-slot:body-cell-size="props">
          <q-td :props="props" class="text-right">
            {{ props.row.size }} Mo
          </q-td>
        </template>

        <template v-slot:body-cell-pages="props">
          <q-td :props="props" class="text-right">
            {{ props.row.pages }}
          </q-td>
        </template>

        <template v-slot:body-cell-tokens="props">
          <q-td :props="props" class="text-right">
            {{ formatNumber(props.row.tokens) }}
          </q-td>
        </template>

        <template v-slot:body-cell-indexed="props">
          <q-td :props="props" class="text-center">
            <indexation-cell
              :value="props.row.indexed"
              :is-indexing="isIndexing && currentIndexingId === props.row.id"
              :execution-time="props.row.indexationTime"
              @indexation-complete="(time) => onIndexationComplete(props.row.id, time)"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props" class="text-center">
            <actions-cell
              :row="props.row"
              @index="onIndex"
              @index-method="onIndexMethod"
              @rename="onRename"
              @duplicate="onDuplicate"
              @delete="onDelete"
              @download="onDownload"
            />
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- Card view -->
    <div v-else class="row q-mt-md q-gutter-md justify-start">
      <document-card
        v-for="doc in sortedAndFilteredDocuments"
        :key="doc.id"
        :row="doc"
        :selected="isDocumentSelected(doc)"
        :is-indexing="isIndexing && currentIndexingId === doc.id"
        @update:selected="toggleSelection(doc)"
        @index="onIndex"
        @index-method="onIndexMethod"
        @rename="onRename"
        @duplicate="onDuplicate"
        @delete="onDelete"
        @download="onDownload"
        @toggle-activation="toggleActivation"
        @open-drawer="toggleDrawer"
        @indexation-complete="(time) => onIndexationComplete(doc.id, time)"
      />
    </div>

    <!-- Dialogs and Drawers -->
    <rename-dialog
      v-model="showRenameDialog"
      :current-name="selectedDocument?.name || ''"
      @rename="handleRename"
    />

    <document-drawer
      v-model="showDrawer"
      :document="selectedDocument"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useDocumentData } from '@/composables/useDocumentData'
import { useDocumentActions } from '@/composables/useDocumentActions'
import { useIndexation } from '@/composables/useIndexation'
import { useDocumentPagination } from '@/composables/useDocumentPagination'
import type { Document } from '@/types/document'
import TableToolbar from './TableToolbar.vue'
import DocumentCard from './DocumentCard.vue'
import ActivationCell from './cells/ActivationCell.vue'
import IndexationCell from './cells/IndexationCell.vue'
import ActionsCell from './cells/ActionsCell.vue'
import RenameDialog from './dialogs/RenameDialog.vue'
import DocumentDrawer from './DocumentDrawer.vue'

const $q = useQuasar()
const { documents, columns, selectedDocuments, loading, toggleActivation, setIndexed, renameDocument, deleteDocuments } = useDocumentData()
const { confirmDelete, notify } = useDocumentActions()
const { isIndexing, currentIndexingId, startIndexing, handleIndexationComplete } = useIndexation()
const { pagination, rowsPerPageOptions, updatePagination } = useDocumentPagination()

const filter = ref('')
const showRenameDialog = ref(false)
const showDrawer = ref(false)
const selectedDocument = ref<Document | null>(null)

const shouldShowCards = computed(() => {
  return $q.screen.width < 1200
})

const sortedAndFilteredDocuments = computed(() => {
  let result = [...documents.value]

  // Filtrage
  if (filter.value) {
    const searchTerm = filter.value.toLowerCase()
    result = result.filter(doc => {
      return (
        doc.name.toLowerCase().includes(searchTerm) ||
        doc.createdAt.toLowerCase().includes(searchTerm) ||
        doc.size.toString().includes(searchTerm) ||
        doc.pages.toString().includes(searchTerm) ||
        doc.tokens.toString().includes(searchTerm)
      )
    })
  }

  // Tri
  const { sortBy, descending } = pagination.value
  result.sort((a, b) => {
    const direction = descending ? -1 : 1
    if (typeof a[sortBy] === 'string' && typeof b[sortBy] === 'string') {
      return (a[sortBy] as string).localeCompare(b[sortBy] as string) * direction
    }
    if (sortBy === 'createdAt') {
      return (new Date(a[sortBy]).getTime() - new Date(b[sortBy]).getTime()) * direction
    }
    return ((a[sortBy] as number) - (b[sortBy] as number)) * direction
  })

  return result
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('fr-FR').format(num)
}

const onRequest = (props: any) => {
  updatePagination(props.pagination)
}

const onAdd = () => {
  notify('Fonctionnalité à implémenter: Ajouter un document', 'info')
}

const isDocumentSelected = (doc: Document) => {
  return selectedDocuments.value.some(d => d.id === doc.id)
}

const toggleSelection = (doc: Document) => {
  const index = selectedDocuments.value.findIndex(d => d.id === doc.id)
  if (index === -1) {
    selectedDocuments.value.push(doc)
  } else {
    selectedDocuments.value.splice(index, 1)
  }
}

const toggleDrawer = (doc: Document) => {
  if (selectedDocument.value?.id === doc.id) {
    showDrawer.value = false
    selectedDocument.value = null
  } else {
    selectedDocument.value = doc
    showDrawer.value = true
  }
}

const onIndex = async (doc: Document) => {
  if (await startIndexing(doc)) {
    setIndexed(doc.id)
  }
}

const onIndexSelected = async () => {
  const nonIndexedDocs = selectedDocuments.value.filter(doc => !doc.indexed)
  if (nonIndexedDocs.length === 0) {
    notify('Tous les documents sélectionnés sont déjà indexés', 'info')
    return
  }

  for (const doc of nonIndexedDocs) {
    if (!isIndexing.value) {
      await onIndex(doc)
    } else {
      break
    }
  }
}

const onIndexationComplete = (id: number, time: number) => {
  handleIndexationComplete(documents.value.find(d => d.id === id)!, time)
}

const onIndexMethod = (doc: Document) => {
  notify('Fonctionnalité à implémenter: Méthode d\'indexation', 'info')
}

const onRename = (doc: Document) => {
  selectedDocument.value = doc
  showRenameDialog.value = true
}

const handleRename = async (newName: string) => {
  if (selectedDocument.value) {
    const success = await renameDocument(selectedDocument.value.id, newName)
    if (success) {
      notify('Document renommé avec succès', 'positive')
    }
  }
}

const onDuplicate = (doc: Document) => {
  notify('Fonctionnalité à implémenter: Dupliquer', 'info')
}

const onDuplicateSelected = () => {
  notify(`Fonctionnalité à implémenter: Dupliquer ${selectedDocuments.value.length} documents`, 'info')
}

const onDelete = async (doc: Document) => {
  if (await confirmDelete()) {
    const success = await deleteDocuments([doc.id])
    if (success) {
      notify('Document supprimé avec succès', 'positive')
    }
  }
}

const onDeleteSelected = async () => {
  if (await confirmDelete(selectedDocuments.value.length)) {
    const ids = selectedDocuments.value.map(doc => doc.id)
    const success = await deleteDocuments(ids)
    if (success) {
      notify('Documents supprimés avec succès', 'positive')
    }
  }
}

const onDownload = (doc: Document) => {
  notify('Fonctionnalité à implémenter: Télécharger', 'info')
}

const onDownloadSelected = () => {
  notify(`Fonctionnalité à implémenter: Télécharger ${selectedDocuments.value.length} documents`, 'info')
}
</script>

<style lang="scss" scoped>
.my-sticky-header-table {
  height: calc(100vh - var(--header-height) - 32px);
  
  :deep(.q-table__top) {
    background-color: var(--background-color) !important;
  }

  :deep(thead tr:first-child th) {
    position: sticky;
    top: 0;
    z-index: 2;
    background-color: #1a2634 !important;
    color: var(--text-color);
    font-weight: 500;
    padding: 12px 8px;
    border-bottom: 1px solid var(--border-color);
  }

  :deep(tbody tr) {
    background-color: var(--background-color);
    
    td {
      border-bottom: 1px solid var(--border-color);
    }
    
    &:hover {
      background-color: var(--hover-color);
    }
  }

  :deep(.q-checkbox) {
    .q-checkbox__inner {
      color: var(--text-color);
      
      &:before {
        border-color: var(--text-color);
      }
    }
    
    &.q-checkbox--checked {
      .q-checkbox__inner {
        color: var(--primary-color);
      }
    }
  }
}

@media (max-width: 599px) {
  .my-sticky-header-table {
    height: calc(100vh - var(--header-height-mobile) - 24px);
  }
}
</style>