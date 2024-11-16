import { describe, it, expect, beforeEach } from 'vitest'
import { useDocumentSelection } from '@/composables/useDocumentSelection'

describe('useDocumentSelection', () => {
    let selection: ReturnType<typeof useDocumentSelection>
    const mockDocument = {
        id: 1,
        name: 'test.pdf',
        active: true,
        createdAt: '2024-03-14',
        size: 1.5,
        pages: 10,
        tokens: 1000,
        indexed: false
    }

    beforeEach(() => {
        selection = useDocumentSelection()
    })

    it('should initialize with empty selection', () => {
        expect(selection.selectedDocuments.value).toEqual([])
        expect(selection.hasSelection.value).toBe(false)
        expect(selection.selectionCount.value).toBe(0)
    })

    it('should toggle document selection', () => {
        selection.toggleSelection(mockDocument)
        expect(selection.isSelected(mockDocument)).toBe(true)
        expect(selection.selectionCount.value).toBe(1)

        selection.toggleSelection(mockDocument)
        expect(selection.isSelected(mockDocument)).toBe(false)
        expect(selection.selectionCount.value).toBe(0)
    })

    it('should select all documents', () => {
        const mockDocuments = [
            mockDocument,
            { ...mockDocument, id: 2 },
            { ...mockDocument, id: 3 }
        ]

        selection.selectAll(mockDocuments)
        expect(selection.selectionCount.value).toBe(3)
        expect(selection.hasSelection.value).toBe(true)
    })

    it('should clear selection', () => {
        selection.selectAll([mockDocument])
        expect(selection.selectionCount.value).toBe(1)

        selection.clearSelection()
        expect(selection.selectionCount.value).toBe(0)
        expect(selection.hasSelection.value).toBe(false)
    })
})