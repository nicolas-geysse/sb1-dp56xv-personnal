import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useDocumentsStore } from '@/stores/documents'
import { documentService } from '@/services/documentService'

vi.mock('@/services/documentService', () => ({
    documentService: {
        fetchItems: vi.fn(),
        toggleActivation: vi.fn(),
        createFolder: vi.fn(),
        renameDocument: vi.fn(),
        renameFolder: vi.fn(),
        deleteDocument: vi.fn(),
        deleteFolder: vi.fn(),
        moveItems: vi.fn()
    }
}))

describe('Documents Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        vi.clearAllMocks()
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

    describe('createFolder', () => {
        it('should create folder at root level', async () => {
            const store = useDocumentsStore()
            vi.mocked(documentService.createFolder).mockResolvedValueOnce(mockFolder)

            const result = await store.createFolder('Test Folder')
            expect(result).toBe(true)
            expect(store.items).toContainEqual(mockFolder)
        })

        it('should create subfolder and update parent statistics', async () => {
            const store = useDocumentsStore()
            const parentFolder = { ...mockFolder }
            const subfolder = {
                ...mockFolder,
                id: 'folder2',
                name: 'Subfolder',
                parentId: 'folder1'
            }

            store.items = [parentFolder]
            vi.mocked(documentService.createFolder).mockResolvedValueOnce(subfolder)

            const result = await store.createFolder('Subfolder', 'folder1')
            expect(result).toBe(true)
            
            // Check if subfolder was added to parent's children
            const parent = store.items.find(item => item.id === 'folder1') as typeof mockFolder
            expect(parent.statistics.totalCount).toBe(3) // Original 2 + new subfolder
        })

        it('should handle folder creation error', async () => {
            const store = useDocumentsStore()
            vi.mocked(documentService.createFolder).mockRejectedValueOnce(new Error('Failed'))

            const result = await store.createFolder('Test Folder')
            expect(result).toBe(false)
            expect(store.items).toHaveLength(0)
        })
    })

    describe('moveItems', () => {
        it('should move items to target folder', async () => {
            const store = useDocumentsStore()
            const targetFolder = { ...mockFolder, id: 'folder2' }
            const itemToMove = { ...mockDocument }

            store.items = [targetFolder, itemToMove]
            vi.mocked(documentService.moveItems).mockResolvedValueOnce(true)

            const result = await store.moveItems([itemToMove], targetFolder.id)
            expect(result).toBe(true)
            
            // Check if item was moved
            const movedItem = store.items.find(item => item.id === itemToMove.id)
            expect(movedItem?.parentId).toBe(targetFolder.id)
        })

        it('should handle moving folder with children', async () => {
            const store = useDocumentsStore()
            const sourceFolder = {
                ...mockFolder,
                children: [{ ...mockDocument, parentId: 'folder1' }]
            }
            const targetFolder = { ...mockFolder, id: 'folder2' }

            store.items = [sourceFolder, targetFolder]
            vi.mocked(documentService.moveItems).mockResolvedValueOnce(true)

            const result = await store.moveItems([sourceFolder], targetFolder.id)
            expect(result).toBe(true)
            
            // Check if folder and its children were moved
            const movedFolder = store.items.find(item => item.id === sourceFolder.id)
            expect(movedFolder?.parentId).toBe(targetFolder.id)
            expect(movedFolder?.children?.[0].parentId).toBe(sourceFolder.id)
        })

        it('should prevent moving folder to its own child', async () => {
            const store = useDocumentsStore()
            const parentFolder = { ...mockFolder }
            const childFolder = {
                ...mockFolder,
                id: 'folder2',
                parentId: 'folder1'
            }

            store.items = [parentFolder, childFolder]

            const result = await store.moveItems([parentFolder], childFolder.id)
            expect(result).toBe(false)
            expect(parentFolder.parentId).toBe('root')
        })
    })

    describe('navigation', () => {
        it('should navigate to folder and fetch its contents', async () => {
            const store = useDocumentsStore()
            const folderContents = [{ ...mockDocument, parentId: 'folder1' }]
            vi.mocked(documentService.fetchItems).mockResolvedValueOnce(folderContents)

            await store.navigateToFolder('folder1')
            expect(store.currentPath).toContain('folder1')
            expect(store.items).toEqual(folderContents)
        })

        it('should navigate back to parent folder', async () => {
            const store = useDocumentsStore()
            store.currentPath = ['root', 'folder1']
            const parentContents = [mockFolder]
            vi.mocked(documentService.fetchItems).mockResolvedValueOnce(parentContents)

            await store.navigateBack()
            expect(store.currentPath).toEqual(['root'])
            expect(store.items).toEqual(parentContents)
        })

        it('should not navigate back from root', async () => {
            const store = useDocumentsStore()
            store.currentPath = ['root']

            await store.navigateBack()
            expect(store.currentPath).toEqual(['root'])
            expect(documentService.fetchItems).not.toHaveBeenCalled()
        })
    })
})