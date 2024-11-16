import { describe, it, expect, beforeEach } from 'vitest'
import { useDocumentSort } from '@/composables/useDocumentSort'

describe('useDocumentSort', () => {
    const mockDocuments = [
        {
            id: 1,
            name: 'B.pdf',
            active: true,
            createdAt: '2024-03-14',
            size: 2.5,
            pages: 20,
            tokens: 2000,
            indexed: false
        },
        {
            id: 2,
            name: 'A.pdf',
            active: false,
            createdAt: '2024-03-13',
            size: 1.5,
            pages: 10,
            tokens: 1000,
            indexed: true
        }
    ]

    let documentSort: ReturnType<typeof useDocumentSort>

    beforeEach(() => {
        documentSort = useDocumentSort(mockDocuments)
    })

    it('should initialize with default sort state', () => {
        expect(documentSort.sortState.value).toEqual({
            field: 'name',
            descending: false
        })
    })

    it('should sort documents by name', () => {
        const sorted = documentSort.sortedDocuments.value
        expect(sorted[0].name).toBe('A.pdf')
        expect(sorted[1].name).toBe('B.pdf')
    })

    it('should toggle sort direction when same field is selected', () => {
        documentSort.updateSort('name')
        expect(documentSort.sortState.value.descending).toBe(true)
        expect(documentSort.sortedDocuments.value[0].name).toBe('B.pdf')
    })

    it('should change sort field and reset direction', () => {
        documentSort.updateSort('size')
        expect(documentSort.sortState.value).toEqual({
            field: 'size',
            descending: false
        })
        expect(documentSort.sortedDocuments.value[0].size).toBe(1.5)
    })

    it('should sort dates correctly', () => {
        documentSort.updateSort('createdAt')
        const sorted = documentSort.sortedDocuments.value
        expect(sorted[0].createdAt).toBe('2024-03-13')
        expect(sorted[1].createdAt).toBe('2024-03-14')
    })
})