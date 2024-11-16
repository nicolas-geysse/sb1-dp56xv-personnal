import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FileSystemItem, Document, Folder } from '@/types/document'

export const useSelectionStore = defineStore('selection', () => {
    const selectedItems = ref<FileSystemItem[]>([])
    const selectedItem = ref<FileSystemItem | null>(null)

    const hasSelection = computed(() => selectedItems.value.length > 0)
    
    const totalSelectedCount = computed(() => {
        return selectedItems.value.reduce((total, item) => {
            if (item.type === 'document') {
                return total + 1
            } else {
                return total + (item as Folder).statistics.totalCount + 1
            }
        }, 0)
    })

    const selectedDocumentsCount = computed(() => {
        return selectedItems.value.reduce((total, item) => {
            if (item.type === 'document') {
                return total + 1
            } else {
                return total + (item as Folder).statistics.totalCount
            }
        }, 0)
    })

    const nonIndexedCount = computed(() => {
        return selectedItems.value.reduce((total, item) => {
            if (item.type === 'document') {
                return total + (!(item as Document).indexed ? 1 : 0)
            } else {
                const folder = item as Folder
                return total + (folder.statistics.totalCount - folder.statistics.indexedCount)
            }
        }, 0)
    })

    const toggleSelection = (item: FileSystemItem) => {
        const index = selectedItems.value.findIndex(i => i.id === item.id && i.type === item.type)
        if (index === -1) {
            selectedItems.value.push(item)
        } else {
            selectedItems.value.splice(index, 1)
        }
    }

    const selectItem = (item: FileSystemItem | null) => {
        selectedItem.value = item
    }

    const clearSelection = () => {
        selectedItems.value = []
        selectedItem.value = null
    }

    return {
        selectedItems,
        selectedItem,
        hasSelection,
        totalSelectedCount,
        selectedDocumentsCount,
        nonIndexedCount,
        toggleSelection,
        selectItem,
        clearSelection
    }
})