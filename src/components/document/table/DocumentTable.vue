<template>
  <div class="q-pa-md">
    <document-table-toolbar 
      v-model:filter="filter"
      :selected-count="selectedDocuments?.length || 0"
      :is-mobile="shouldShowCards"
      @add="onAdd"
      @index-selected="onIndexSelected"
      @duplicate-selected="onDuplicateSelected"
      @download-selected="onDownloadSelected"
      @delete-selected="onDeleteSelected"
    />

    <!-- Table view -->
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
        class="document-table"
        virtual-scroll
        :virtual-scroll-slice-size="10"
        :virtual-scroll-slice-ratio-before="0.3"
        :virtual-scroll-slice-ratio-after="0.3"
        :virtual-scroll-item-size="48"
      >
        <template v-slot:header="props">
          <document-table-header
            :columns="columns"
            :props="props"
          />
        </template>

        <template v-slot:body="props">
          <document-table-row
            v-for="row in props.rows"
            :key="row.id"
            :row="row"
            :props="props"
            :is-selected="isSelected(row)"
            :is-indexing="isIndexing && currentIndexingId === row.id"
            @update:selected="toggleSelection(row)"
            @toggle-activation="toggleActivation"
            @open-drawer="toggleDrawer"
            @index="onIndex"
            @index-method="onIndexMethod"
            @rename="onRename"
            @duplicate="onDuplicate"
            @delete="onDelete"
            @download="onDownload"
            @indexation-complete="(time) => onIndexationComplete(row.id, time)"
          />
        </template>
      </q-table>
    </div>

    <!-- Card view -->
    <div v-else class="document-cards q-mt-md q-gutter-md justify-start">
      <document-card
        v-for="doc in sortedAndFilteredDocuments"
        :key="doc.id"
        :row="doc"
        :selected="isSelected(doc)"
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
    <document-rename-dialog
      v-model="showRenameDialog"
      :current-name="selectedDocument?.name || ''"
      @rename="handleRename"
    />

    <document-details-drawer
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
import DocumentTableToolbar from './toolbar/DocumentTableToolbar.vue'
import DocumentTableHeader from './header/DocumentTableHeader.vue'
import DocumentTableRow from './row/DocumentTableRow.vue'
import DocumentCard from '../card/DocumentCard.vue'
import DocumentRenameDialog from '../dialog/DocumentRenameDialog.vue'
import DocumentDetailsDrawer from '../drawer/DocumentDetailsDrawer.vue'

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
  if (!documents.value) return []
  
  let result = [...documents.value]

  // Filtering
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

  // Sorting
  const { sortBy, descending } = pagination.value
  if (sortBy) {
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
  }

  return result
})

const isSelected = (doc: Document) => {
  return selectedDocuments.value.includes(doc)
}

const onRequest = (props: any) => {
  updatePagination(props.pagination)
}

const onAdd = () => {
  notify('Fonctionnalité à implémenter: Ajouter un document', 'info')
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
      showRenameDialog.value = false
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
</script>

<style lang="scss" scoped>
.document-table {
  height: calc(100vh - var(--header-height) - 32px);

  :deep(.q-table__top) {
    background-color: var(--background-color) !important;
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

.document-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

@media (max-width: $breakpoint-xs) {
  .document-table {
    height: calc(100vh - var(--header-height-mobile) - 24px);
  }
}
</style>