<template>
  <q-dialog v-model="isOpen" persistent class="custom-dialog">
    <q-card dark style="min-width: 375px">
      <q-card-section class="row items-center">
        <div class="text-h6">Déplacer "{{ item?.name }}"</div>
      </q-card-section>

      <q-card-section class="folder-list q-pa-none">
        <q-list dark separator>
          <template v-if="currentPath.length > 1">
            <q-item clickable v-ripple @click="navigateToParent">
              <q-item-section avatar>
                <q-icon name="arrow_upward" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Dossier parent</q-item-label>
              </q-item-section>
            </q-item>
          </template>

          <q-item
            v-for="folder in currentFolders"
            :key="folder.id"
            clickable
            v-ripple
            :active="selectedFolderId === folder.id"
            @click="selectFolder(folder)"
          >
            <q-item-section avatar>
              <q-icon name="folder" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ folder.name }}</q-item-label>
            </q-item-section>
            <q-item-section side v-if="hasSubfolders(folder)">
              <q-btn
                flat
                round
                dense
                icon="chevron_right"
                color="primary"
                @click.stop="navigateToFolder(folder)"
              />
            </q-item-section>
            <q-item-section side v-else-if="canMoveToFolder(folder)">
              <q-btn
                flat
                dense
                color="primary"
                label="Déplacer"
                @click.stop="moveToFolder(folder)"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-separator dark inset />

      <q-card-section>
        <document-breadcrumb
          :path="currentPath"
          @navigate="onNavigate"
        />
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn
          flat
          label="Nouveau dossier"
          color="primary"
          @click="showCreateFolderDialog = true"
        />
        <q-space />
        <q-btn
          flat
          label="Annuler"
          color="grey-7"
          v-close-popup
        />
        <q-btn
          flat
          label="Déplacer"
          color="primary"
          :disable="!selectedFolderId || !canMoveToSelected"
          @click="moveToSelected"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <create-folder-dialog
    v-model="showCreateFolderDialog"
    @create="handleCreateFolder"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDocumentsStore } from '@/stores/documents'
import type { FileSystemItem, Folder } from '@/types/document'
import type { PathNode } from '@/types/navigation'
import DocumentBreadcrumb from '../DocumentBreadcrumb.vue'
import CreateFolderDialog from './CreateFolderDialog.vue'

interface Props {
  modelValue: boolean
  item: FileSystemItem | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'move', targetFolderId: string): void
}>()

const documentsStore = useDocumentsStore()
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const showCreateFolderDialog = ref(false)
const selectedFolderId = ref<string | null>(null)
const currentPath = ref<PathNode[]>([
  { id: 'root', name: 'Documents', type: 'root', parentId: null }
])

const currentFolders = computed(() => {
  const currentFolderId = currentPath.value[currentPath.value.length - 1].id
  return documentsStore.items
    .filter(item => 
      item.type === 'folder' && 
      item.parentId === currentFolderId &&
      item.id !== props.item?.id
    ) as Folder[]
})

const hasSubfolders = (folder: Folder) => {
  return documentsStore.items.some(item => 
    item.type === 'folder' && item.parentId === folder.id
  )
}

const canMoveToFolder = (folder: Folder) => {
  if (!props.item) return false
  
  // Can't move to itself or its children
  if (props.item.type === 'folder') {
    const isChildFolder = (parentId: string | null): boolean => {
      if (!parentId) return false
      if (parentId === props.item?.id) return true
      const parent = documentsStore.items.find(item => item.id === parentId)
      return parent ? isChildFolder(parent.parentId) : false
    }
    if (isChildFolder(folder.id)) return false
  }

  return true
}

const canMoveToSelected = computed(() => {
  if (!selectedFolderId.value || !props.item) return false
  const folder = documentsStore.items.find(item => 
    item.type === 'folder' && item.id === selectedFolderId.value
  ) as Folder | undefined
  return folder ? canMoveToFolder(folder) : false
})

const selectFolder = (folder: Folder) => {
  selectedFolderId.value = folder.id
}

const navigateToFolder = (folder: Folder) => {
  currentPath.value = [
    ...currentPath.value,
    { id: folder.id, name: folder.name, type: 'folder', parentId: folder.parentId }
  ]
  selectedFolderId.value = null
}

const navigateToParent = () => {
  if (currentPath.value.length > 1) {
    currentPath.value.pop()
    selectedFolderId.value = null
  }
}

const onNavigate = (node: PathNode) => {
  const index = currentPath.value.findIndex(n => n.id === node.id)
  if (index !== -1) {
    currentPath.value = currentPath.value.slice(0, index + 1)
    selectedFolderId.value = null
  }
}

const moveToFolder = (folder: Folder) => {
  if (canMoveToFolder(folder)) {
    emit('move', folder.id)
    isOpen.value = false
  }
}

const moveToSelected = () => {
  if (selectedFolderId.value && canMoveToSelected.value) {
    emit('move', selectedFolderId.value)
    isOpen.value = false
  }
}

const handleCreateFolder = async (name: string) => {
  const currentFolderId = currentPath.value[currentPath.value.length - 1].id
  await documentsStore.createFolder(name, currentFolderId)
  showCreateFolderDialog.value = false
}
</script>

<style lang="scss" scoped>
.folder-list {
  max-height: 400px;
  overflow-y: auto;
}

:deep(.q-item) {
  min-height: 48px;
  padding: 8px 16px;
  
  &.q-item--active {
    background: rgba(85, 199, 204, 0.1);
  }
  
  &:hover {
    background: rgba(85, 199, 204, 0.05);
  }
}

:deep(.q-separator) {
  background-color: var(--border-color);
}
</style>