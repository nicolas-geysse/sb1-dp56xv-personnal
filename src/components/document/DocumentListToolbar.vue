<template>
  <div class="toolbar-container q-px-md">
    <!-- Actions Row -->
    <div class="row q-col-gutter-md items-center">
      <div class="col">
        <div class="row q-col-gutter-md items-center">
          <transition-group 
            name="bulk-action"
            class="row q-col-gutter-md items-center"
            tag="div"
          >
            <template v-if="(selectedItems?.length || 0) > 0">
              <div :class="actionButtonClass" key="index">
                <q-btn
                  class="bulk-action-btn"
                  icon="pending_actions"
                  :label="`Indexer (${nonIndexedCount})`"
                  @click="$emit('index-selected')"
                  :disable="nonIndexedCount === 0"
                >
                  <q-tooltip>
                    {{ indexTooltip }}
                  </q-tooltip>
                </q-btn>
              </div>
              <div :class="actionButtonClass" key="duplicate">
                <q-btn
                  class="bulk-action-btn"
                  icon="file_copy"
                  :label="`Dupliquer (${selectedItems?.length || 0})`"
                  @click="$emit('duplicate-selected')"
                >
                  <q-tooltip>
                    {{ duplicateTooltip }}
                  </q-tooltip>
                </q-btn>
              </div>
              <div :class="actionButtonClass" key="download">
                <q-btn
                  class="bulk-action-btn"
                  icon="download"
                  :label="`Télécharger (${selectedDocumentsCount})`"
                  @click="$emit('download-selected')"
                  :disable="selectedDocumentsCount === 0"
                >
                  <q-tooltip>
                    {{ downloadTooltip }}
                  </q-tooltip>
                </q-btn>
              </div>
              <div :class="actionButtonClass" key="delete">
                <q-btn
                  color="negative"
                  icon="delete"
                  :label="`Supprimer (${selectedItems?.length || 0})`"
                  @click="$emit('delete-selected')"
                >
                  <q-tooltip>
                    {{ deleteTooltip }}
                  </q-tooltip>
                </q-btn>
              </div>
            </template>
          </transition-group>
        </div>
      </div>
      <div class="col-auto">
        <q-btn-dropdown
          color="primary"
          icon="add"
          label="Nouveau"
          split
          @click="$emit('add')"
          class="custom-dropdown"
        >
          <q-list dark class="custom-menu">
            <q-item
              clickable
              v-close-popup
              @click="$emit('add')"
              class="custom-menu-item"
            >
              <q-item-section avatar>
                <q-icon name="upload_file" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Nouveau document</q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              v-close-popup
              @click="$emit('create-folder')"
              class="custom-menu-item"
            >
              <q-item-section avatar>
                <q-icon name="create_new_folder" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Nouveau dossier</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </div>

    <!-- Search Row -->
    <div class="row q-mt-md">
      <div class="search-wrapper">
        <q-input
          v-model="searchModel"
          dark
          outlined
          dense
          debounce="300"
          label="Rechercher"
          class="search-input"
          bg-color="#374151"
          @update:model-value="onSearchUpdate"
        >
          <template v-slot:append>
            <q-icon name="search" color="primary" />
          </template>
        </q-input>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FileSystemItem } from '@/types/document'

interface Props {
  filter: string
  isMobile?: boolean
  selectedItems: FileSystemItem[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:filter', value: string): void
  (e: 'add'): void
  (e: 'create-folder'): void
  (e: 'index-selected'): void
  (e: 'duplicate-selected'): void
  (e: 'download-selected'): void
  (e: 'delete-selected'): void
}>()

const searchModel = ref(props.filter)

const actionButtonClass = computed(() => 
  props.isMobile ? 'col-12' : 'col-auto'
)

const nonIndexedCount = computed(() => {
  return (props.selectedItems || []).reduce((total, item) => {
    if (item.type === 'document' && !item.indexed) {
      return total + 1
    } else if (item.type === 'folder') {
      const { totalCount, indexedCount } = item.statistics
      return total + (totalCount - indexedCount)
    }
    return total
  }, 0)
})

const selectedDocumentsCount = computed(() => {
  return (props.selectedItems || []).reduce((total, item) => {
    if (item.type === 'document') {
      return total + 1
    } else if (item.type === 'folder') {
      return total + item.statistics.totalCount
    }
    return total
  }, 0)
})

const indexTooltip = computed(() => {
  const folders = (props.selectedItems || []).filter(item => item.type === 'folder')
  const documents = (props.selectedItems || []).filter(item => item.type === 'document')
  
  const parts = []
  if (folders.length > 0) {
    const nonIndexedInFolders = folders.reduce((total, folder) => {
      const { totalCount, indexedCount } = folder.statistics
      return total + (totalCount - indexedCount)
    }, 0)
    if (nonIndexedInFolders > 0) {
      parts.push(`${nonIndexedInFolders} document(s) dans ${folders.length} dossier(s)`)
    }
  }
  
  const nonIndexedDocs = documents.filter(doc => !doc.indexed).length
  if (nonIndexedDocs > 0) {
    parts.push(`${nonIndexedDocs} document(s) sélectionné(s)`)
  }
  
  return parts.length > 0 
    ? `Indexer ${parts.join(' et ')}`
    : 'Tous les documents sont déjà indexés'
})

const duplicateTooltip = computed(() => {
  const folders = (props.selectedItems || []).filter(item => item.type === 'folder')
  const documents = (props.selectedItems || []).filter(item => item.type === 'document')
  
  const parts = []
  if (folders.length > 0) {
    parts.push(`${folders.length} dossier(s)`)
  }
  if (documents.length > 0) {
    parts.push(`${documents.length} document(s)`)
  }
  
  return `Dupliquer ${parts.join(' et ')}`
})

const downloadTooltip = computed(() => {
  return `Télécharger ${selectedDocumentsCount.value} document(s)`
})

const deleteTooltip = computed(() => {
  const folders = (props.selectedItems || []).filter(item => item.type === 'folder')
  const documents = (props.selectedItems || []).filter(item => item.type === 'document')
  
  const parts = []
  if (folders.length > 0) {
    parts.push(`${folders.length} dossier(s)`)
  }
  if (documents.length > 0) {
    parts.push(`${documents.length} document(s)`)
  }
  
  return `Supprimer ${parts.join(' et ')}`
})

const onSearchUpdate = (value: string) => {
  emit('update:filter', value)
}
</script>

<style lang="scss" scoped>
.toolbar-container {
  width: 100%;
  padding-bottom: 0;
}

.search-wrapper {
  width: var(--card-min-width);
}

.q-btn {
  min-width: 130px;
  height: 38px;
}

.bulk-action-btn {
  background-color: #35494D;
  color: var(--text-color);
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #55C7CC;
  }
}

.search-input {
  :deep(.q-field__control) {
    background-color: #374151;
    border: 1px solid var(--primary-color);
    transition: border-color 0.3s ease;
  }

  :deep(.q-field__label) {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  :deep(.q-field__native) {
    color: var(--text-color);
    padding: 8px 0;
  }

  :deep(.q-field__marginal) {
    height: 40px;
  }
}

.custom-dropdown {
  :deep(.q-list) {
    background-color: #35494D;
  }
}

.custom-menu {
  background-color: #35494D !important;
  color: var(--text-color);
  
  .custom-menu-item {
    transition: background-color 0.3s ease;
    
    &:hover {
      background-color: #55C7CC !important;
    }
  }
}

// Transitions for bulk action buttons
.bulk-action-enter-active,
.bulk-action-leave-active {
  transition: all 0.3s ease;
}

.bulk-action-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.bulk-action-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.bulk-action-move {
  transition: transform 0.3s ease;
}

@media (max-width: 599px) {
  .q-btn {
    width: 100%;
    margin-bottom: 8px;
  }
}
</style>