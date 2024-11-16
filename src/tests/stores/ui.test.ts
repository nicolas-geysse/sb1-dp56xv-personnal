import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUIStore } from '@/stores/ui'

describe('UI Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    describe('dialog management', () => {
        it('should toggle create folder dialog', () => {
            const store = useUIStore()
            expect(store.showCreateFolderDialog).toBe(false)

            store.toggleCreateFolderDialog(true)
            expect(store.showCreateFolderDialog).toBe(true)

            store.toggleCreateFolderDialog()
            expect(store.showCreateFolderDialog).toBe(false)
        })

        it('should toggle rename dialog', () => {
            const store = useUIStore()
            expect(store.showRenameDialog).toBe(false)

            store.toggleRenameDialog(true)
            expect(store.showRenameDialog).toBe(true)

            store.toggleRenameDialog()
            expect(store.showRenameDialog).toBe(false)
        })

        it('should toggle details drawer', () => {
            const store = useUIStore()
            expect(store.showDetailsDrawer).toBe(false)

            store.toggleDetailsDrawer(true)
            expect(store.showDetailsDrawer).toBe(true)

            store.toggleDetailsDrawer()
            expect(store.showDetailsDrawer).toBe(false)
        })
    })
})