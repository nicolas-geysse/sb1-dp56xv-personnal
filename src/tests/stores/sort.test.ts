import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useSortStore } from '@/stores/sort'

vi.mock('@/stores/filter', () => ({
    useFilterStore: () => ({
        filteredItems: [
            {
                id: '1',
                name: 'B.pdf',
                type: 'document',
                indexed: false,
                active: true,
                createdAt: '2024-03-14',
                size: 2.5,
                pages: 20,
                tokens: 2000,
                parentId: 'root'
            },
            {
                id: '2',
                name: 'A.pdf',
                type: 'document',
                indexed: false,
                active: true,
                createdAt: '2024-03-13',
                size: 1.5,
                pages: 10,
                tokens: 1000,
                parentId: 'root'
            }
        ]
    })
}))

describe('Sort Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    describe('sorting', () => {
        it('should sort by name ascending', () => {
            const store = useSortStore()
            
            store.updateSort('name')
            expect(store.sortedItems[0].name).toBe('A.pdf')
            expect(store.sortedItems[1].name).toBe('B.pdf')
        })

        it('should sort by name descending', () => {
            const store = useSortStore()
            
            store.updateSort('name')
            store.updateSort('name') // Toggle descending
            expect(store.sortedItems[0].name).toBe('B.pdf')
            expect(store.sortedItems[1].name).toBe('A.pdf')
        })

        it('should sort by date', () => {
            const store = useSortStore()
            
            store.updateSort('createdAt')
            expect(store.sortedItems[0].createdAt).toBe('2024-03-13')
            expect(store.sortedItems[1].createdAt).toBe('2024-03-14')
        })

        it('should sort folders before documents', () => {
            const store = useSortStore()
            const mockFolder = {
                id: 'folder1',
                name: 'Z Folder',
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
            
            vi.mocked(useFilterStore).mockImplementation(() => ({
                filteredItems: [
                    {
                        id: '1',
                        name: 'A.pdf',
                        type: 'document',
                        indexed: false,
                        active: true,
                        createdAt: '2024-03-14',
                        size: 1.5,
                        pages: 10,
                        tokens: 1000,
                        parentId: 'root'
                    },
                    mockFolder
                ]
            }))

            store.updateSort('name')
            expect(store.sortedItems[0].type).toBe('folder')
            expect(store.sortedItems[1].type).toBe('document')
        })
    })
})