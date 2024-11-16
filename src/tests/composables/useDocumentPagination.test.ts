import { describe, it, expect, beforeEach } from 'vitest'
import { useDocumentPagination } from '@/composables/useDocumentPagination'

describe('useDocumentPagination', () => {
    let pagination: ReturnType<typeof useDocumentPagination>

    beforeEach(() => {
        pagination = useDocumentPagination()
    })

    it('should initialize with default values', () => {
        expect(pagination.pagination.value).toEqual({
            page: 1,
            rowsPerPage: 10,
            sortBy: 'name',
            descending: false
        })
    })

    it('should have correct rows per page options', () => {
        expect(pagination.rowsPerPageOptions).toEqual([5, 10, 20])
    })

    it('should update pagination state', () => {
        pagination.updatePagination({ page: 2, rowsPerPage: 20 })
        expect(pagination.pagination.value).toEqual({
            page: 2,
            rowsPerPage: 20,
            sortBy: 'name',
            descending: false
        })
    })

    it('should reset pagination to default values', () => {
        pagination.updatePagination({ page: 2, rowsPerPage: 20 })
        pagination.resetPagination()
        expect(pagination.pagination.value).toEqual({
            page: 1,
            rowsPerPage: 10,
            sortBy: 'name',
            descending: false
        })
    })

    it('should paginate documents correctly', () => {
        const mockDocuments = Array.from({ length: 15 }, (_, i) => ({
            id: i + 1,
            name: `Document ${i + 1}`
        }))

        pagination.updatePagination({ page: 1, rowsPerPage: 10 })
        const firstPage = pagination.paginatedDocuments.value(mockDocuments)
        expect(firstPage).toHaveLength(10)

        pagination.updatePagination({ page: 2, rowsPerPage: 10 })
        const secondPage = pagination.paginatedDocuments.value(mockDocuments)
        expect(secondPage).toHaveLength(5)
    })
})