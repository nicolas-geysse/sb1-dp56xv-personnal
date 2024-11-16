import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useIndexationStore } from '@/stores/indexation'
import { documentService } from '@/services/documentService'

vi.mock('@/services/documentService', () => ({
    documentService: {
        indexDocument: vi.fn(),
        indexFolder: vi.fn()
    }
}))

describe('Indexation Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        vi.clearAllMocks()
    })

    describe('startIndexing', () => {
        const mockDocument = {
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
        }

        it('should not start indexing if document is already indexed', async () => {
            const store = useIndexationStore()
            const indexedDoc = { ...mockDocument, indexed: true }
            
            const result = await store.startIndexing(indexedDoc)
            
            expect(result).toBe(false)
            expect(documentService.indexDocument).not.toHaveBeenCalled()
        })

        it('should not start indexing if document is already being indexed', async () => {
            const store = useIndexationStore()
            
            // Start first indexation
            vi.mocked(documentService.indexDocument).mockResolvedValueOnce({
                success: true,
                executionTime: 2.5
            })
            store.startIndexing(mockDocument)

            // Try to start second indexation
            const result = await store.startIndexing(mockDocument)
            
            expect(result).toBe(false)
            expect(documentService.indexDocument).toHaveBeenCalledTimes(1)
        })

        it('should successfully index a document', async () => {
            const store = useIndexationStore()
            
            vi.mocked(documentService.indexDocument).mockResolvedValueOnce({
                success: true,
                executionTime: 2.5
            })

            const result = await store.startIndexing(mockDocument)
            
            expect(result).toBe(true)
            expect(documentService.indexDocument).toHaveBeenCalledWith(mockDocument.id)
            expect(store.isIndexing).toBe(false)
            expect(store.currentIndexingId).toBeNull()
        })

        it('should handle indexation failure', async () => {
            const store = useIndexationStore()
            
            vi.mocked(documentService.indexDocument).mockResolvedValueOnce({
                success: false,
                executionTime: 0
            })

            const result = await store.startIndexing(mockDocument)
            
            expect(result).toBe(false)
            expect(documentService.indexDocument).toHaveBeenCalledWith(mockDocument.id)
            expect(store.isIndexing).toBe(false)
            expect(store.currentIndexingId).toBeNull()
        })
    })

    describe('startFolderIndexing', () => {
        const mockFolder = {
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

        const mockDocuments = [
            {
                id: '1',
                name: 'doc1.pdf',
                type: 'document',
                indexed: false,
                active: true,
                createdAt: '2024-03-14',
                size: 1.5,
                pages: 10,
                tokens: 1000,
                parentId: 'folder1'
            },
            {
                id: '2',
                name: 'doc2.pdf',
                type: 'document',
                indexed: false,
                active: true,
                createdAt: '2024-03-14',
                size: 1.5,
                pages: 10,
                tokens: 1000,
                parentId: 'folder1'
            }
        ]

        it('should not start indexing if folder is already being indexed', async () => {
            const store = useIndexationStore()
            
            vi.mocked(documentService.indexFolder).mockResolvedValueOnce(mockDocuments)
            store.startFolderIndexing(mockFolder)

            const result = await store.startFolderIndexing(mockFolder)
            
            expect(result).toBe(false)
            expect(documentService.indexFolder).toHaveBeenCalledTimes(1)
        })

        it('should not start indexing if folder has no documents to index', async () => {
            const store = useIndexationStore()
            
            vi.mocked(documentService.indexFolder).mockResolvedValueOnce([])

            const result = await store.startFolderIndexing(mockFolder)
            
            expect(result).toBe(false)
            expect(documentService.indexFolder).toHaveBeenCalledWith(mockFolder.id)
        })

        it('should start indexing all documents in folder', async () => {
            const store = useIndexationStore()
            
            vi.mocked(documentService.indexFolder).mockResolvedValueOnce(mockDocuments)
            vi.mocked(documentService.indexDocument).mockResolvedValue({
                success: true,
                executionTime: 2.5
            })

            const result = await store.startFolderIndexing(mockFolder)
            
            expect(result).toBe(true)
            expect(documentService.indexFolder).toHaveBeenCalledWith(mockFolder.id)
            expect(store.isItemIndexing(mockFolder.id)).toBe(false)
            
            const state = store.getIndexingState(mockFolder.id)
            expect(state).toBeUndefined()
        })

        it('should handle folder indexation failure', async () => {
            const store = useIndexationStore()
            
            vi.mocked(documentService.indexFolder).mockRejectedValueOnce(new Error('Failed'))

            const result = await store.startFolderIndexing(mockFolder)
            
            expect(result).toBe(false)
            expect(documentService.indexFolder).toHaveBeenCalledWith(mockFolder.id)
            expect(store.isItemIndexing(mockFolder.id)).toBe(false)
        })
    })

    describe('Queue Management', () => {
        const mockDocuments = [
            {
                id: '1',
                name: 'doc1.pdf',
                type: 'document',
                indexed: false,
                active: true,
                createdAt: '2024-03-14',
                size: 1.5,
                pages: 10,
                tokens: 1000,
                parentId: 'folder1'
            },
            {
                id: '2',
                name: 'doc2.pdf',
                type: 'document',
                indexed: false,
                active: true,
                createdAt: '2024-03-14',
                size: 1.5,
                pages: 10,
                tokens: 1000,
                parentId: 'folder1'
            }
        ]

        it('should add non-indexed documents to queue', () => {
            const store = useIndexationStore()
            store.addToQueue(mockDocuments)
            
            expect(store.indexingQueue).toHaveLength(2)
        })

        it('should not add already indexed documents to queue', () => {
            const store = useIndexationStore()
            const indexedDocs = mockDocuments.map(doc => ({ ...doc, indexed: true }))
            
            store.addToQueue(indexedDocs)
            
            expect(store.indexingQueue).toHaveLength(0)
        })

        it('should not add duplicate documents to queue', () => {
            const store = useIndexationStore()
            
            store.addToQueue(mockDocuments)
            store.addToQueue(mockDocuments)
            
            expect(store.indexingQueue).toHaveLength(2)
        })

        it('should start indexing first document in queue if no indexation is running', async () => {
            const store = useIndexationStore()
            
            vi.mocked(documentService.indexDocument).mockResolvedValue({
                success: true,
                executionTime: 2.5
            })

            store.addToQueue(mockDocuments)
            
            expect(store.isIndexing).toBe(true)
            expect(store.currentIndexingId).toBe(mockDocuments[0].id)
            expect(store.indexingQueue).toHaveLength(1)
        })
    })
})