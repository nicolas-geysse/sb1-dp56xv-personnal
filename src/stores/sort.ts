import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FileSystemItem } from '@/types/document'
import { useFilterStore } from './filter'

interface SortState {
    field: keyof FileSystemItem
    descending: boolean
}

export const useSortStore = defineStore('sort', () => {
    const filterStore = useFilterStore()
    const sortState = ref<SortState>({
        field: 'name',
        descending: false
    })

    const sortedItems = computed(() => {
        const items = [...filterStore.filteredItems]

        return items.sort((a, b) => {
            const direction = sortState.value.descending ? -1 : 1
            
            // Always sort folders before documents
            if (a.type !== b.type) {
                return a.type === 'folder' ? -1 : 1
            }

            const field = sortState.value.field
            if (typeof a[field] === 'string' && typeof b[field] === 'string') {
                return (a[field] as string).localeCompare(b[field] as string) * direction
            }
            
            if (field === 'createdAt') {
                return (new Date(a[field]).getTime() - new Date(b[field]).getTime()) * direction
            }

            return ((a[field] as number) - (b[field] as number)) * direction
        })
    })

    const updateSort = (field: keyof FileSystemItem) => {
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
        sortedItems,
        updateSort
    }
})