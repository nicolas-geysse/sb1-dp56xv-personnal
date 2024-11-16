import { ref, computed } from 'vue'
import type { Document } from '@/types/document'

export function useDocumentFilter(documents: Document[]) {
    const filter = ref('')

    const filteredDocuments = computed(() => {
        if (!filter.value) {
            return documents
        }

        const searchTerm = filter.value.toLowerCase()
        return documents.filter(doc => {
            return (
                doc.name.toLowerCase().includes(searchTerm) ||
                doc.createdAt.toLowerCase().includes(searchTerm) ||
                doc.size.toString().includes(searchTerm) ||
                doc.pages.toString().includes(searchTerm) ||
                doc.tokens.toString().includes(searchTerm)
            )
        })
    })

    const updateFilter = (value: string) => {
        filter.value = value
    }

    return {
        filter,
        filteredDocuments,
        updateFilter
    }
}