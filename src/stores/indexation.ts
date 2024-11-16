import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Document, Folder } from '@/types/document'
import { useNotificationsStore } from './notifications'
import { documentService } from '@/services/documentService'

interface IndexingState {
    isIndexing: boolean
    progress: number
    startTime: number | null
    currentFile?: number
    totalFiles?: number
}

export const useIndexationStore = defineStore('indexation', () => {
    const notificationsStore = useNotificationsStore()
    const isIndexing = ref(false)
    const currentIndexingId = ref<string | null>(null)
    const indexingQueue = ref<Document[]>([])
    const folderIndexingQueue = ref<Folder[]>([])
    const indexingStates = ref(new Map<string, IndexingState>())

    const isItemIndexing = computed(() => (id: string) => {
        return indexingStates.value.has(id)
    })

    const getIndexingState = computed(() => (id: string) => {
        return indexingStates.value.get(id)
    })

    const cleanupIndexing = (id: string) => {
        indexingStates.value.delete(id)

        if (indexingQueue.value.length > 0) {
            const nextDoc = indexingQueue.value.shift()
            if (nextDoc) {
                currentIndexingId.value = nextDoc.id
                startIndexing(nextDoc, true)
                return false
            }
        }

        if (indexingQueue.value.length === 0 && folderIndexingQueue.value.length > 0) {
            const nextFolder = folderIndexingQueue.value.shift()
            if (nextFolder) {
                startFolderIndexing(nextFolder)
                return false
            }
        }

        isIndexing.value = false
        currentIndexingId.value = null
        return true
    }

    const addToQueue = (documents: Document[]) => {
        const newDocs = documents.filter(doc => 
            !doc.indexed && !indexingQueue.value.some(d => d.id === doc.id)
        )
        
        if (newDocs.length > 0) {
            indexingQueue.value.push(...newDocs)
            notificationsStore.notify(`${newDocs.length} document(s) ajouté(s) à la file d'indexation`, 'info')

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
            notificationsStore.notify('Ce document est déjà indexé', 'info')
            return false
        }

        if (indexingStates.value.has(doc.id)) {
            notificationsStore.notify('Ce document est déjà en cours d\'indexation', 'info')
            return false
        }

        if (isIndexing.value && !fromQueue) {
            if (!indexingQueue.value.some(d => d.id === doc.id)) {
                indexingQueue.value.push(doc)
                notificationsStore.notify('Document ajouté à la file d\'indexation', 'info')
            }
            return false
        }

        isIndexing.value = true
        currentIndexingId.value = doc.id

        indexingStates.value.set(doc.id, {
            isIndexing: true,
            progress: 0,
            startTime: Date.now()
        })

        try {
            const result = await documentService.indexDocument(doc.id)
            if (result.success) {
                doc.indexed = true
                doc.indexationTime = result.executionTime
                notificationsStore.notify('Document indexé avec succès', 'positive')
            } else {
                notificationsStore.notify('Échec de l\'indexation', 'negative')
            }
        } catch (error) {
            notificationsStore.notify('Erreur lors de l\'indexation', 'negative')
            return false
        } finally {
            cleanupIndexing(doc.id)
        }

        return true
    }

    const startFolderIndexing = async (folder: Folder) => {
        try {
            if (indexingStates.value.has(folder.id)) {
                notificationsStore.notify('Ce dossier est déjà en cours d\'indexation', 'info')
                return false
            }

            const documents = await documentService.indexFolder(folder.id)
            if (documents.length === 0) {
                notificationsStore.notify('Aucun document à indexer dans ce dossier', 'info')
                return false
            }

            indexingStates.value.set(folder.id, {
                isIndexing: true,
                progress: 0,
                startTime: Date.now(),
                currentFile: 0,
                totalFiles: documents.length
            })

            addToQueue(documents)

            const updateFolderProgress = () => {
                const state = indexingStates.value.get(folder.id)
                if (state) {
                    state.currentFile = documents.filter(doc => doc.indexed).length
                    state.progress = (state.currentFile / state.totalFiles!) * 100
                }
            }

            const interval = setInterval(updateFolderProgress, 500)

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

            clearInterval(interval)
            indexingStates.value.delete(folder.id)
            return true
        } catch (error) {
            notificationsStore.notify('Erreur lors de l\'indexation du dossier', 'negative')
            return false
        }
    }

    return {
        isIndexing,
        currentIndexingId,
        indexingQueue,
        isItemIndexing,
        getIndexingState,
        startIndexing,
        startFolderIndexing,
        addToQueue
    }
})