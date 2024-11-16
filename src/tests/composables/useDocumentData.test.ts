import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useDocumentData } from '@/composables/useDocumentData'
import { documentService } from '@/services/documentService'

vi.mock('@/services/documentService', () => ({
    documentService: {
        fetchDocuments: vi.fn(),
        toggleActivation: vi.fn()
    }
}))

describe('useDocumentData', () => {
    let documentData: ReturnType<typeof useDocumentData>

    beforeEach(() => {
        vi.clearAllMocks()
        documentData = useDocumentData()
    })

    it('should initialize with empty documents array', () => {
        expect(documentData.documents.value).toEqual([])
    })

    it('should initialize with empty selected documents array', () => {
        expect(documentData.selectedDocuments.value).toEqual([])
    })

    it('should have loading state initialized as false', () => {
        expect(documentData.loading.value).toBe(false)
    })

    it('should successfully toggle document activation', async () => {
        // Mock the document in the documents array
        documentData.documents.value = [{
            id: 1,
            name: 'test.pdf',
            active: false,
            createdAt: '2024-03-14',
            size: 1.5,
            pages: 10,
            tokens: 1000,
            indexed: false
        }]

        // Mock the service response
        vi.mocked(documentService.toggleActivation).mockResolvedValueOnce({
            success: true,
            active: true
        })

        // Test the toggle
        const result = await documentData.toggleActivation(1)
        expect(result).toBe(true)
        expect(documentData.documents.value[0].active).toBe(true)
        expect(documentService.toggleActivation).toHaveBeenCalledWith(1)
    })

    it('should handle failed activation toggle', async () => {
        documentData.documents.value = [{
            id: 1,
            name: 'test.pdf',
            active: false,
            createdAt: '2024-03-14',
            size: 1.5,
            pages: 10,
            tokens: 1000,
            indexed: false
        }]

        vi.mocked(documentService.toggleActivation).mockResolvedValueOnce({
            success: false,
            active: false
        })

        const result = await documentData.toggleActivation(1)
        expect(result).toBe(false)
        expect(documentData.documents.value[0].active).toBe(false)
    })

    it('should maintain activation state consistency', async () => {
        // Initial state
        documentData.documents.value = [{
            id: 1,
            name: 'test.pdf',
            active: false,
            createdAt: '2024-03-14',
            size: 1.5,
            pages: 10,
            tokens: 1000,
            indexed: false
        }]

        // First toggle: false -> true
        vi.mocked(documentService.toggleActivation).mockResolvedValueOnce({
            success: true,
            active: true
        })
        await documentData.toggleActivation(1)
        expect(documentData.documents.value[0].active).toBe(true)

        // Second toggle: true -> false
        vi.mocked(documentService.toggleActivation).mockResolvedValueOnce({
            success: true,
            active: false
        })
        await documentData.toggleActivation(1)
        expect(documentData.documents.value[0].active).toBe(false)
    })
})