import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useSelectionStore } from '@/stores/selection'

describe('Selection Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    const mockDocument = {
        id: '1',
        name: 'test.pdf',
        type: 'document' as const,
        indexed: false,
        active: true,
        createdAt: '2024-03-14',
        size: 1.5,
        pages: 10,
        tokens: 1000,
        parentId: 'root'
    }

    const mockFolder = {
        id: 'folder1',
        name: 'Test Folder',
        type: 'folder' as const,
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

    describe('selection management', () => {
        it('should toggle item selection', () => {
            const store = useSelectionStore()
            
            store.toggleSelection(mockDocument)
            expect(store.selectedItems).toHaveLength(1)
            expect(store.hasSelection).toBe(true)

            store.toggleSelection(mockDocument)
            expect(store.selectedItems).toHaveLength(0)
            expect(store.hasSelection).toBe(false)
        })

        it('should calculate total selected count correctly', () => {
            const store = useSelectionStore()
            
            store.toggleSelection(mockDocument)
            store.toggleSelection(mockFolder)
            
            // 1 document + 1 folder + 2 documents in folder
            expect(store.totalSelectedCount).toBe(4)
        })

        it('should calculate selected documents count correctly', () => {
            const store = useSelectionStore()
            
            store.toggleSelection(mockDocument)
            store.toggleSelection(mockFolder)
            
            // 1 document + 2 documents in folder
            expect(store.selectedDocumentsCount).toBe(3)
        })

        it('should calculate non-indexed count correctly', () => {
            const store = useSelectionStore()
            
            store.toggleSelection(mockDocument)
            store.toggleSelection(mockFolder)
            
            // 1 non-indexed document + 2 non-indexed in folder
            expect(store.nonIndexedCount).toBe(3)
        })

        it('should clear selection', () => {
            const store = useSelectionStore()
            
            store.toggleSelection(mockDocument)
            store.selectItem(mockDocument)
            
            store.clearSelection()
            expect(store.selectedItems).toHaveLength(0)
            expect(store.selectedItem).toBeNull()
        })
    })
})