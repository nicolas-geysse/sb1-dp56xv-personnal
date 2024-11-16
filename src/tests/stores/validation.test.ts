import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useValidationStore } from '@/stores/validation'

describe('Validation Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    describe('validateFolderName', () => {
        it('should validate empty folder name', () => {
            const store = useValidationStore()
            expect(store.validateFolderName('')).toBe('Le nom du dossier ne peut pas être vide')
            expect(store.validateFolderName('   ')).toBe('Le nom du dossier ne peut pas être vide')
        })

        it('should validate folder name with special characters', () => {
            const store = useValidationStore()
            expect(store.validateFolderName('folder/name')).toBe(
                'Le nom du dossier ne peut pas contenir de caractères spéciaux'
            )
            expect(store.validateFolderName('folder\\name')).toBe(
                'Le nom du dossier ne peut pas contenir de caractères spéciaux'
            )
        })

        it('should accept valid folder names', () => {
            const store = useValidationStore()
            expect(store.validateFolderName('Documents')).toBeNull()
            expect(store.validateFolderName('My Folder')).toBeNull()
            expect(store.validateFolderName('Folder-123')).toBeNull()
        })
    })

    describe('validateFileName', () => {
        it('should validate empty file name', () => {
            const store = useValidationStore()
            expect(store.validateFileName('', 'test.pdf')).toBe(
                'Le nom du fichier ne peut pas être vide'
            )
        })

        it('should validate file extension', () => {
            const store = useValidationStore()
            expect(store.validateFileName('test.doc', 'test.pdf')).toBe(
                'Le fichier doit conserver l\'extension ".pdf"'
            )
        })

        it('should validate file name with special characters', () => {
            const store = useValidationStore()
            expect(store.validateFileName('file/name.pdf', 'test.pdf')).toBe(
                'Le nom du fichier ne peut pas contenir de caractères spéciaux'
            )
        })

        it('should accept valid file names', () => {
            const store = useValidationStore()
            expect(store.validateFileName('document.pdf', 'test.pdf')).toBeNull()
            expect(store.validateFileName('My File.pdf', 'test.pdf')).toBeNull()
            expect(store.validateFileName('File-123.pdf', 'test.pdf')).toBeNull()
        })
    })

    describe('validateBulkOperation', () => {
        it('should validate empty selection', () => {
            const store = useValidationStore()
            expect(store.validateBulkOperation([], 'delete')).toBe(
                'Aucun élément sélectionné pour l\'opération "delete"'
            )
        })

        it('should accept valid selection', () => {
            const store = useValidationStore()
            expect(store.validateBulkOperation([{ id: 1 }], 'delete')).toBeNull()
        })
    })
})