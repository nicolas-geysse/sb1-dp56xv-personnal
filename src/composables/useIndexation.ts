import { ref } from 'vue'
import type { Document, Folder } from '@/types/document'
import { useQuasar } from 'quasar'
import { documentService } from '@/services/documentService'

// État global de l'indexation
const globalIndexingState = new Map<string, {
    isIndexing: boolean
    progress: number
    startTime: number | null
    currentFile?: number
    totalFiles?: number
}>()

export function useIndexation() {
    const $q = useQuasar()
    const isIndexing = ref(false)
    const currentIndexingId = ref<string | null>(null)
    const indexingQueue = ref<Document[]>([])
    const folderIndexingQueue = ref<Folder[]>([])

    const notify = (message: string, type: 'positive' | 'negative' | 'warning' | 'info' = 'info') => {
        $q.notify({
            message,
            color: type,
            position: 'top',
            timeout: 2500
        })
    }

    const cleanupIndexing = (id: string) => {
        // Supprimer l'état d'indexation global
        globalIndexingState.delete(id)

        // Traiter le prochain élément de la file d'attente
        if (indexingQueue.value.length > 0) {
            const nextDoc = indexingQueue.value.shift()
            if (nextDoc) {
                currentIndexingId.value = nextDoc.id
                startIndexing(nextDoc, true)
                return false // Ne pas réinitialiser isIndexing
            }
        }

        // Traiter le prochain dossier si la file de documents est vide
        if (indexingQueue.value.length === 0 && folderIndexingQueue.value.length > 0) {
            const nextFolder = folderIndexingQueue.value.shift()
            if (nextFolder) {
                startFolderIndexing(nextFolder)
                return false // Ne pas réinitialiser isIndexing
            }
        }

        isIndexing.value = false
        currentIndexingId.value = null
        return true // Réinitialisation complète
    }

    const addToQueue = (documents: Document[]) => {
        const newDocs = documents.filter(doc => 
            !doc.indexed && !indexingQueue.value.some(d => d.id === doc.id)
        )
        
        if (newDocs.length > 0) {
            indexingQueue.value.push(...newDocs)
            notify(`${newDocs.length} document(s) ajouté(s) à la file d'indexation`, 'info')

            // Démarrer l'indexation si aucune n'est en cours
            if (!isIndexing.value && indexingQueue.value.length > 0) {
                const firstDoc = indexingQueue.value.shift()
                if (firstDoc) {
                    startIndexing(firstDoc, true)
                }
            }
        }
    }

    const startIndexing = async (doc: Document, fromQueue: boolean = false): Promise<boolean> => {
        if (doc.indexed) {
            notify('Ce document est déjà indexé', 'info')
            return false
        }

        // Vérifier si déjà en cours d'indexation globalement
        if (globalIndexingState.has(doc.id)) {
            notify('Ce document est déjà en cours d\'indexation', 'info')
            return false
        }

        if (isIndexing.value && !fromQueue) {
            // Ajouter à la file d'attente si pas déjà présent
            if (!indexingQueue.value.some(d => d.id === doc.id)) {
                indexingQueue.value.push(doc)
                notify('Document ajouté à la file d\'indexation', 'info')
            }
            return false
        }

        isIndexing.value = true
        currentIndexingId.value = doc.id

        // Définir l'état d'indexation global
        globalIndexingState.set(doc.id, {
            isIndexing: true,
            progress: 0,
            startTime: Date.now()
        })

        try {
            const result = await documentService.indexDocument(doc.id)
            if (result.success) {
                doc.indexed = true
                doc.indexationTime = result.executionTime
                notify('Document indexé avec succès', 'positive')
            } else {
                notify('Échec de l\'indexation', 'negative')
            }
        } catch (error) {
            notify('Erreur lors de l\'indexation', 'negative')
            return false
        } finally {
            cleanupIndexing(doc.id)
        }

        return true
    }

    const startFolderIndexing = async (folder: Folder) => {
        try {
            // Vérifier si le dossier est déjà en cours d'indexation
            if (globalIndexingState.has(folder.id)) {
                notify('Ce dossier est déjà en cours d\'indexation', 'info')
                return false
            }

            const documents = await documentService.indexFolder(folder.id)
            if (documents.length === 0) {
                notify('Aucun document à indexer dans ce dossier', 'info')
                return false
            }

            // Définir l'état d'indexation du dossier
            globalIndexingState.set(folder.id, {
                isIndexing: true,
                progress: 0,
                startTime: Date.now(),
                currentFile: 0,
                totalFiles: documents.length
            })

            // Ajouter tous les documents à la file d'attente
            addToQueue(documents)

            // Mettre à jour l'état d'indexation du dossier pendant le processus
            const updateFolderProgress = () => {
                const state = globalIndexingState.get(folder.id)
                if (state) {
                    state.currentFile = documents.filter(doc => doc.indexed).length
                    state.progress = (state.currentFile / state.totalFiles) * 100
                }
            }

            // Observer l'indexation des documents
            const interval = setInterval(updateFolderProgress, 500)

            // Nettoyer une fois terminé
            const cleanup = () => {
                clearInterval(interval)
                globalIndexingState.delete(folder.id)
            }

            // Attendre que tous les documents soient indexés
            await Promise.all(documents.map(doc => {
                return new Promise(resolve => {
                    const checkIndexed = setInterval(() => {
                        if (doc.indexed) {
                            clearInterval(checkIndexed)
                            resolve(true)
                        }
                    }, 500)
                })
            }))

            cleanup()
            return true
        } catch (error) {
            notify('Erreur lors de l\'indexation du dossier', 'negative')
            return false
        }
    }

    const isItemIndexing = (id: string) => {
        return globalIndexingState.has(id)
    }

    const getIndexingState = (id: string) => {
        return globalIndexingState.get(id)
    }

    return {
        isIndexing,
        currentIndexingId,
        indexingQueue,
        startIndexing,
        startFolderIndexing,
        isItemIndexing,
        getIndexingState,
        addToQueue
    }
}