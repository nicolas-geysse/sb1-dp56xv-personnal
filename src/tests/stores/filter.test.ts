import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useFilterStore } from '@/stores/filter'

vi.mock('@/stores/documents', () => ({
    useDocumentsStore: () => ({
        items: [
            {
                id: '1',
                name: 'test.pdf',
                type: 'document',
                indexed: false,
                active: true,
                createdAt: '2024-03-14',
                size: 1.5,
                pages: 10,
                tokens: 1000,
                parentId: 'root'
            },
            {
                id: 'folder1',
                name: 'Test Folder',
                type: 'folder',
                createdAt: '2024-03-14',
                parentId: 'root',
                statistics: {
                    totalSize: 3.0,
                    totalPages: 20,
                    totalTokens: 2000,
                    indexedCount: 0,
                    totalCount: 2
                }
            }
        ]
    })
}))

describe('Filter Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    describe('filtering', () => {
        it('should return all items when no filter', () => {
            const store = useFilterStore()
            expect(store.filteredItems).toHaveLength(2)
        })

        it('should filter items by name', () => {
            const store = useFilterStore()
            
            store.updateSearchQuery('test')
            expect(store.filteredItems).toHaveLength(2)
            
            store.updateSearchQuery('pdf')
            expect(store.filteredItems).toHaveLength(1)
        })

        it('should filter items by date', () => {
            const store = useFilterStore()
            
            store.updateSearchQuery('2024-03-14')
            expect(store.filteredItems).toHaveLength(2)
            
            store.updateSearchQuery('2024-03-15')
            expect(store.filteredItems).toHaveLength(0)
        })

        it('should clear filter', () => {
            const store = useFilterStore()
            
            store.updateSearchQuery('test')
            expect(store.filteredItems).toHaveLength(2)
            
            store.clearFilter()
            expect(store.searchQuery).toBe('')
            expect(store.filteredItems).toHaveLength(2)
        })
    })
})