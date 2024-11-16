import { ref } from 'vue'
import type { Document } from '@/types/document'
import { useQuasar } from 'quasar'
import { documentService } from '@/services/documentService'

export function useDocumentActions() {
  const $q = useQuasar()
  const isIndexing = ref(false)
  const currentIndexingId = ref<number | null>(null)
  const indexingTimeouts = new Map<number, number>()

  const notify = (message: string, type: 'positive' | 'negative' | 'info' = 'info') => {
    $q.notify({
      message,
      color: type,
      position: 'top',
      timeout: 2500
    })
  }

  const confirmDelete = (count: number = 1): Promise<boolean> => {
    return new Promise((resolve) => {
      $q.dialog({
        title: 'Confirmer la suppression',
        message: `Êtes-vous sûr de vouloir supprimer ${count > 1 ? `ces ${count} documents` : 'ce document'} ?`,
        cancel: true,
        persistent: true,
        dark: true,
        class: 'custom-dialog',
        ok: {
          label: 'Supprimer',
          flat: true,
          color: 'negative'
        },
        cancel: {
          label: 'Annuler',
          flat: true,
          color: 'grey-7'
        }
      }).onOk(() => {
        resolve(true)
      }).onCancel(() => {
        resolve(false)
      })
    })
  }

  const cleanupIndexing = () => {
    const timeout = indexingTimeouts.get(currentIndexingId.value!)
    if (timeout) {
      window.clearTimeout(timeout)
      indexingTimeouts.delete(currentIndexingId.value!)
    }
    isIndexing.value = false
    currentIndexingId.value = null
  }

  const simulateIndexing = async (id: number): Promise<boolean> => {
    // Si une indexation est déjà en cours, on refuse la nouvelle demande
    if (isIndexing.value) {
      notify('Une indexation est déjà en cours', 'negative')
      return false
    }

    isIndexing.value = true
    currentIndexingId.value = id
    
    try {
      // Garantie de nettoyage après un délai maximum
      const maxTimeout = window.setTimeout(() => {
        notify('L\'indexation a dépassé le délai maximum', 'negative')
        cleanupIndexing()
      }, 15000) // 15 secondes maximum
      
      indexingTimeouts.set(id, maxTimeout)

      const result = await documentService.indexDocument(id)
      
      if (result.success) {
        await new Promise(resolve => setTimeout(resolve, 200)) // Petit délai pour la transition visuelle
        cleanupIndexing()
        return true
      }
      
      throw new Error('Échec de l\'indexation')
    } catch (error) {
      console.error('Erreur lors de l\'indexation:', error)
      notify('Erreur lors de l\'indexation du document', 'negative')
      cleanupIndexing()
      return false
    }
  }

  const validateFileName = (newName: string, currentName: string): string | null => {
    if (!newName.trim()) {
      return 'Le nom du fichier ne peut pas être vide'
    }

    const currentExt = currentName.slice(currentName.lastIndexOf('.'))
    if (!newName.endsWith(currentExt)) {
      return `Le fichier doit conserver l'extension "${currentExt}"`
    }

    return null
  }

  return {
    isIndexing,
    currentIndexingId,
    simulateIndexing,
    confirmDelete,
    validateFileName,
    notify
  }
}