<template>
  <div class="q-pa-md">
    <document-list-toolbar 
      v-model:filter="filter"
      :selected-items="documentsStore.selectedItems"
      :is-mobile="shouldShowCards"
      @add="onAdd"
      @create-folder="showCreateFolderDialog = true"
      @index-selected="onIndexSelected"
      @duplicate-selected="onDuplicateSelected"
      @download-selected="onDownloadSelected"
      @delete-selected="onDeleteSelected"
    />

    <document-breadcrumb
      :path="navigationStore.currentPath"
      @navigate="onNavigate"
      class="q-mt-md"
    />

    <!-- Table view -->
    <div v-if="!shouldShowCards" class="q-mt-md">
      <q-table
        :rows="sortedAndFilteredItems"
        :columns="tableStore.columns"
        row-key="id"
        :filter="filter"
        :loading="documentsStore.loading"
        dark
        flat
        bordered
        :pagination="pagination"
        :rows-per-page-options="rowsPerPageOptions"
        selection="multiple"
        v-model:selected="documentsStore.selectedItems"
        @request="onRequest"
        class="document-table"
        virtual-scroll
        :virtual-scroll-slice-size="10"
        :virtual-scroll-slice-ratio-before="0.3"
        :virtual-scroll-slice-ratio-after="0.3"
        :virtual-scroll-item-size="48"
      >
        <template v-slot:body-cell-name="props">
          <q-td :props="props">
            <div 
              class="text-primary cursor-pointer row items-center"
              @click="onItemClick(props.row)"
            >
              <q-icon
                v-if="props.row.type === 'folder'"
                name="folder"
                color="primary"
                size="sm"
                class="q-mr-sm"
              />
              {{ props.row.name }}
              <span v-if="props.row.type === 'folder'" class="text-grey-6 q-ml-sm">
                [{{ props.row.statistics.totalCount }}]
              </span>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-active="props">
          <q-td :props="props" class="text-center">
            <document-activation-cell
              v-if="props.row.type === 'document'"
              v-model:value="props.row.active"
              @update:value="documentsStore.toggleActivation(props.row.id)"
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
            {{ props.row.type === 'document' ? props.row.size : props.row.statistics.totalSize }} Mo
          </q-td>
        </template>

        <template v-slot:body-cell-pages="props">
          <q-td :props="props" class="text-right">
            {{ props.row.type === 'document' ? props.row.pages : props.row.statistics.totalPages }}
          </q-td>
        </template>

        <template v-slot:body-cell-tokens="props">
          <q-td :props="props" class="text-right">
            {{ formatNumber(props.row.type === 'document' ? props.row.tokens : props.row.statistics.totalTokens) }}
          </q-td>
        </template>

        <template v-slot:body-cell-indexed="props">
          <q-td :props="props" class="text-center">
            <document-indexation-cell
              v-if="props.row.type === 'document'"
              :value="props.row.indexed"
              :is-indexing="indexationStore.isItemIndexing(props.row.id)"
              :execution-time="props.row.indexationTime"
              @indexation-complete="(time) => onIndexationComplete(props.row.id, time)"
            />
            <folder-indexation-status
              v-else
              :statistics="props.row.statistics"
              :is-indexing="indexationStore.isItemIndexing(props.row.id)"
              v-bind="indexationStore.getIndexingState(props.row.id)"
              @index="onIndex(props.row)"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props" class="text-center">
            <document-actions-cell
              :row="props.row"
              @index="onIndex"
              @index-method="onIndexMethod"
              @rename="onRename"
              @duplicate="onDuplicate"
              @delete="onDelete"
              @download="onDownload"
              @move="onMove"
            />
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- Dialogs -->
    <document-rename-dialog
      v-model="showRenameDialog"
      :current-name="selectedItem?.name || ''"
      @rename="handleRename"
    />

    <create-folder-dialog
      v-model="showCreateFolderDialog"
      @create="handleCreateFolder"
    />

    <!-- Move To Dialog -->
    <move-to-dialog
      v-model="showMoveDialog"
      :item="selectedItem"
      @move="handleMove"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useDocumentsStore } from '@/stores/documents'
import { useIndexationStore } from '@/stores/indexation'
import { useNavigationStore } from '@/stores/navigation'
import { useTableStore } from '@/stores/table'
import { useDocumentPagination } from '@/composables/useDocumentPagination'
import type { Document, FileSystemItem } from '@/types/document'
import type { PathNode } from '@/types/navigation'

import DocumentListToolbar from './DocumentListToolbar.vue'
import DocumentBreadcrumb from './DocumentBreadcrumb.vue'
import DocumentActionsCell from './cells/DocumentActionsCell.vue'
import DocumentActivationCell from './cells/DocumentActivationCell.vue'
import DocumentIndexationCell from './cells/DocumentIndexationCell.vue'
import FolderIndexationStatus from './cells/FolderIndexationStatus.vue'
import DocumentRenameDialog from './dialogs/DocumentRenameDialog.vue'
import CreateFolderDialog from './dialogs/CreateFolderDialog.vue'
import MoveToDialog from './dialogs/MoveToDialog.vue'

const $q = useQuasar()
const documentsStore = useDocumentsStore()
const indexationStore = useIndexationStore()
const navigationStore = useNavigationStore()
const tableStore = useTableStore()
const { pagination, rowsPerPageOptions, updatePagination } = useDocumentPagination()

const filter = ref('')
const showRenameDialog = ref(false)
const showCreateFolderDialog = ref(false)
const showMoveDialog = ref(false)
const showDrawer = ref(false)
const selectedItem = ref<FileSystemItem | null>(null)

const shouldShowCards = computed(() => {
  return $q.screen.width < 1200
})

const sortedAndFilteredItems = computed(() => {
  if (!documentsStore.items) return []
  
  let result = [...documentsStore.items]

  // Filtering
  if (filter.value) {
    const searchTerm = filter.value.toLowerCase()
    result = result.filter(item => {
      if (item.type === 'document') {
        return (
          item.name.toLowerCase().includes(searchTerm) ||
          item.createdAt.toLowerCase().includes(searchTerm) ||
          item.size.toString().includes(searchTerm) ||
          item.pages.toString().includes(searchTerm) ||
          item.tokens.toString().includes(searchTerm)
        )
      } else {
        return (
          item.name.toLowerCase().includes(searchTerm) ||
          item.createdAt.toLowerCase().includes(searchTerm)
        )
      }
    })
  }

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
  $q.notify({
    message: 'Fonctionnalité à implémenter: Ajouter un document',
    color: 'info'
  })
}

const onItemClick = (item: FileSystemItem) => {
  if (item.type === 'folder') {
    navigationStore.navigateTo({
      id: item.id,
      name: item.name,
      type: 'folder',
      parentId: item.parentId
    })
    documentsStore.fetchItems(item.id)
  } else {
    toggleDrawer(item)
  }
}

const onNavigate = async (node: PathNode) => {
  navigationStore.navigateTo(node)
  await documentsStore.fetchItems(node.id)
}

const onIndex = async (item: FileSystemItem) => {
  if (item.type === 'document') {
    if (await indexationStore.startIndexing(item)) {
      documentsStore.setIndexed(item.id)
    }
  } else {
    await indexationStore.startFolderIndexing(item)
  }
}

const onIndexSelected = async () => {
  const nonIndexedDocs = documentsStore.selectedItems
    .filter(item => item.type === 'document' && !(item as Document).indexed) as Document[]
  
  if (nonIndexedDocs.length === 0) {
    $q.notify({
      message: 'Tous les documents sélectionnés sont déjà indexés',
      color: 'info'
    })
    return
  }

  indexationStore.addToQueue(nonIndexedDocs)
}

const onIndexationComplete = (id: string, time: number) => {
  const doc = documentsStore.items.find(item => 
    item.type === 'document' && item.id === id
  ) as Document | undefined
  
  if (doc) {
    doc.indexed = true
    doc.indexationTime = time
  }
}

const onIndexMethod = (item: FileSystemItem) => {
  $q.notify({
    message: 'Fonctionnalité à implémenter: Méthode d\'indexation',
    color: 'info'
  })
}

const onRename = (item: FileSystemItem) => {
  selectedItem.value = item
  showRenameDialog.value = true
}

const handleRename = async (newName: string) => {
  if (selectedItem.value) {
    await documentsStore.renameItem(selectedItem.value, newName)
    showRenameDialog.value = false
  }
}

const handleCreateFolder = async (name: string) => {
  const currentFolderId = navigationStore.currentFolder.id
  await documentsStore.createFolder(name, currentFolderId)
  showCreateFolderDialog.value = false
}

const onDuplicate = (item: FileSystemItem) => {
  $q.notify({
    message: 'Fonctionnalité à implémenter: Dupliquer',
    color: 'info'
  })
}

const onDuplicateSelected = () => {
  $q.notify({
    message: `Fonctionnalité à implémenter: Dupliquer ${documentsStore.selectedItems.length} éléments`,
    color: 'info'
  })
}

const onDelete = async (item: FileSystemItem) => {
  const confirmed = await $q.dialog({
    title: 'Confirmer la suppression',
    message: 'Êtes-vous sûr de vouloir supprimer cet élément ?',
    cancel: true,
    persistent: true
  })

  if (confirmed) {
    await documentsStore.deleteItems([item])
  }
}

const onDeleteSelected = async () => {
  const confirmed = await $q.dialog({
    title: 'Confirmer la suppression',
    message: `Êtes-vous sûr de vouloir supprimer ces ${documentsStore.selectedItems.length} éléments ?`,
    cancel: true,
    persistent: true
  })

  if (confirmed) {
    await documentsStore.deleteItems(documentsStore.selectedItems)
  }
}

const onDownload = (item: FileSystemItem) => {
  $q.notify({
    message: 'Fonctionnalité à implémenter: Télécharger',
    color: 'info'
  })
}

const onDownloadSelected = () => {
  $q.notify({
    message: `Fonctionnalité à implémenter: Télécharger ${documentsStore.selectedItems.length} éléments`,
    color: 'info'
  })
}

const onMove = (item: FileSystemItem) => {
  selectedItem.value = item
  showMoveDialog.value = true
}

const handleMove = async (targetFolderId: string) => {
  if (selectedItem.value) {
    await documentsStore.moveItems([selectedItem.value], targetFolderId)
    showMoveDialog.value = false
  }
}

const toggleDrawer = (item: FileSystemItem) => {
  if (selectedItem.value?.id === item.id && selectedItem.value?.type === item.type) {
    showDrawer.value = false
    selectedItem.value = null
  } else {
    selectedItem.value = item
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
    .q_checkbox__inner {
      color: var(--text-color);
      
      &:before {
        border-color: var(--text-color);
      }
    }
    
    &.q-checkbox--checked {
      .q_checkbox__inner {
        color: var(--primary-color);
      }
    }
  }
}

@media (max-width: $breakpoint-xs) {
  .document-table {
    height: calc(100vh - var(--header-height-mobile) - 24px);
  }
}
</style>