import { defineStore } from 'pinia'

export const useValidationStore = defineStore('validation', () => {
    const validateFolderName = (name: string): string | null => {
        if (!name.trim()) {
            return 'Le nom du dossier ne peut pas être vide'
        }
        if (name.includes('/') || name.includes('\\')) {
            return 'Le nom du dossier ne peut pas contenir de caractères spéciaux'
        }
        return null
    }

    const validateFileName = (newName: string, currentName: string): string | null => {
        if (!newName.trim()) {
            return 'Le nom du fichier ne peut pas être vide'
        }

        const currentExt = currentName.slice(currentName.lastIndexOf('.'))
        if (!newName.endsWith(currentExt)) {
            return `Le fichier doit conserver l'extension "${currentExt}"`
        }

        if (newName.includes('/') || newName.includes('\\')) {
            return 'Le nom du fichier ne peut pas contenir de caractères spéciaux'
        }

        return null
    }

    const validateBulkOperation = (items: any[], operation: string): string | null => {
        if (items.length === 0) {
            return `Aucun élément sélectionné pour l'opération "${operation}"`
        }
        return null
    }

    return {
        validateFolderName,
        validateFileName,
        validateBulkOperation
    }
})