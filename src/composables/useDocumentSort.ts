import { ref, computed } from 'vue'
import type { Document } from '@/types/document'

export interface SortState {
    field: keyof Document
    descending: boolean
}

export function useDocumentSort(documents: Document[]) {
    const sortState = ref<SortState>({
        field: 'name',
        descending: false
    })

    const sortedDocuments = computed(() => {
        return [...documents].sort((a, b) => {
            const field = sortState.value.field
            const direction = sortState.value.descending ? -1 : 1

            if (typeof a[field] === 'string' && typeof b[field] === 'string') {
                return (a[field] as string).localeCompare(b[field] as string) * direction
            }

            if (field === 'createdAt') {
                return (new Date(a[field]).getTime() - new Date(b[field]).getTime()) * direction
            }

            return ((a[field] as number) - (b[field] as number)) * direction
        })
    })

    const updateSort = (field: keyof Document) => {
        if (sortState.value.field === field) {
            sortState.value.descending = !sortState.value.descending
        } else {
            sortState.value = {
                field,
                descending: false
            }
        }
    }

    return {
        sortState,
        sortedDocuments,
        updateSort
    }
}