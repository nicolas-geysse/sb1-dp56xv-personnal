import { ref, computed } from 'vue'
import type { Document } from '@/types/document'

export function useDocumentSelection() {
    const selectedDocuments = ref<Document[]>([])

    const hasSelection = computed(() => selectedDocuments.value.length > 0)
    const selectionCount = computed(() => selectedDocuments.value.length)

    const isSelected = (doc: Document) => {
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

    const selectAll = (documents: Document[]) => {
        selectedDocuments.value = [...documents]
    }

    const clearSelection = () => {
        selectedDocuments.value = []
    }

    return {
        selectedDocuments,
        hasSelection,
        selectionCount,
        isSelected,
        toggleSelection,
        selectAll,
        clearSelection
    }
}