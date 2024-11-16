import { describe, it, expect, beforeEach } from 'vitest'
import { useIndexation } from '@/composables/useIndexation'

describe('useIndexation', () => {
    let indexation: ReturnType<typeof useIndexation>

    beforeEach(() => {
        indexation = useIndexation()
    })

    it('should initialize with isIndexing as false', () => {
        expect(indexation.isIndexing.value).toBe(false)
    })

    it('should initialize with currentIndexingId as null', () => {
        expect(indexation.currentIndexingId.value).toBeNull()
    })

    it('should handle indexation completion', () => {
        const mockDoc = {
            id: 1,
            name: 'test.pdf',
            indexed: false,
            indexationTime: undefined
        }
        
        indexation.handleIndexationComplete(mockDoc, 2.5)
        expect(mockDoc.indexed).toBe(true)
        expect(mockDoc.indexationTime).toBe(2.5)
    })
})