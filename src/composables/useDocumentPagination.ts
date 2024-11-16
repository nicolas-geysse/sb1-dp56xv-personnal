import { ref, computed } from 'vue'
import type { Document } from '@/types/document'

export interface PaginationState {
    page: number
    rowsPerPage: number
    sortBy: keyof Document
    descending: boolean
}

export function useDocumentPagination() {
    const pagination = ref<PaginationState>({
        page: 1,
        rowsPerPage: 10,
        sortBy: 'name',
        descending: false
    })

    const rowsPerPageOptions = [5, 10, 20]

    const updatePagination = (newState: Partial<PaginationState>) => {
        pagination.value = {
            ...pagination.value,
            ...newState
        }
    }

    const resetPagination = () => {
        pagination.value = {
            page: 1,
            rowsPerPage: 10,
            sortBy: 'name',
            descending: false
        }
    }

    const paginatedDocuments = computed(() => {
        return (documents: Document[]) => {
            const startIndex = (pagination.value.page - 1) * pagination.value.rowsPerPage
            const endIndex = startIndex + pagination.value.rowsPerPage
            return documents.slice(startIndex, endIndex)
        }
    })

    return {
        pagination,
        rowsPerPageOptions,
        updatePagination,
        resetPagination,
        paginatedDocuments
    }
}