import { describe, it, expect } from 'vitest'
import { useDocumentFilter } from '@/composables/useDocumentFilter'

describe('useDocumentFilter', () => {
    const mockDocuments = [
        {
            id: 1,
            name: 'test.pdf',
            createdAt: '2024-03-14',
            size: 1.5,
            pages: 10,
            tokens: 1000,
            active: true,
            indexed: false
        }
    ]

    it('should filter documents by name', () => {
        const { filter, filteredDocuments, updateFilter } = useDocumentFilter(mockDocuments)
        updateFilter('test')
        expect(filteredDocuments.value).toHaveLength(1)
        updateFilter('nonexistent')
        expect(filteredDocuments.value).toHaveLength(0)
    })

    it('should return all documents when filter is empty', () => {
        const { filteredDocuments } = useDocumentFilter(mockDocuments)
        expect(filteredDocuments.value).toEqual(mockDocuments)
    })
})