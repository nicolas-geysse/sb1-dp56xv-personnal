import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FileSystemItem } from '@/types/document'
import { useDocumentsStore } from './documents'

export const useFilterStore = defineStore('filter', () => {
    const documentsStore = useDocumentsStore()
    const searchQuery = ref('')

    const filteredItems = computed(() => {
        if (!searchQuery.value) {
            return documentsStore.items
        }

        const searchTerm = searchQuery.value.toLowerCase()
        return documentsStore.items.filter(item => {
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
    })

    const updateSearchQuery = (query: string) => {
        searchQuery.value = query
    }

    const clearFilter = () => {
        searchQuery.value = ''
    }

    return {
        searchQuery,
        filteredItems,
        updateSearchQuery,
        clearFilter
    }
})