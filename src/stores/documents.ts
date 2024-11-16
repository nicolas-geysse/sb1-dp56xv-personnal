import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Document, FileSystemItem, Folder } from '@/types/document'
import { useNotificationsStore } from './notifications'
import { documentService } from '@/services/documentService'

export const useDocumentsStore = defineStore('documents', () => {
    const notificationsStore = useNotificationsStore()
    const items = ref<FileSystemItem[]>([])
    const selectedItems = ref<FileSystemItem[]>([])
    const loading = ref(false)
    const currentPath = ref<string[]>(['root'])

    const fetchItems = async (parentId: string = currentPath.value[currentPath.value.length - 1]) => {
        loading.value = true
        try {
            items.value = await documentService.fetchItems(parentId)
        } catch (error) {
            console.error('Erreur lors du chargement des éléments:', error)
            notificationsStore.notify('Erreur lors du chargement des éléments', 'negative')
            items.value = []
        } finally {
            loading.value = false
        }
    }

    const toggleActivation = async (id: string) => {
        try {
            const result = await documentService.toggleActivation(id)
            if (result.success) {
                const doc = items.value.find(item => 
                    item.type === 'document' && item.id === id
                ) as Document | undefined
                
                if (doc) {
                    doc.active = result.active
                }
                return true
            }
            return false
        } catch (error) {
            console.error('Erreur lors de la modification de l\'activation:', error)
            notificationsStore.notify('Erreur lors de la modification de l\'activation', 'negative')
            return false
        }
    }

    const setIndexed = (id: string) => {
        const doc = items.value.find(item => 
            item.type === 'document' && item.id === id
        ) as Document | undefined

        if (doc) {
            doc.indexed = true
            return true
        }
        return false
    }

    const createFolder = async (name: string, parentId: string = 'root') => {
        try {
            const newFolder = await documentService.createFolder(name, parentId)
            
            // Function to recursively find the correct parent folder and add the new folder
            const addFolderToParent = (folders: FileSystemItem[], parentId: string, newFolder: Folder): boolean => {
                // If this is a root level folder
                if (parentId === 'root') {
                    folders.push(newFolder)
                    return true
                }

                // Find the parent folder and add the new folder to it
                const parentIndex = folders.findIndex(item => 
                    item.type === 'folder' && item.id === parentId
                )

                if (parentIndex !== -1) {
                    const parent = folders[parentIndex] as Folder
                    if (!parent.children) {
                        parent.children = []
                    }
                    parent.children.push(newFolder)
                    return true
                }

                // Search in children of each folder
                for (const item of folders) {
                    if (item.type === 'folder' && item.children) {
                        if (addFolderToParent(item.children, parentId, newFolder)) {
                            return true
                        }
                    }
                }

                return false
            }

            // Update the state
            const itemsCopy = [...items.value]
            addFolderToParent(itemsCopy, parentId, newFolder)
            items.value = itemsCopy

            // Update statistics for parent folder
            if (parentId !== 'root') {
                const parentFolder = items.value.find(item => 
                    item.type === 'folder' && item.id === parentId
                ) as Folder | undefined
                
                if (parentFolder) {
                    parentFolder.statistics.totalCount += 1
                }
            }

            notificationsStore.notify('Dossier créé avec succès', 'positive')
            return true
        } catch (error) {
            console.error('Erreur lors de la création du dossier:', error)
            notificationsStore.notify('Erreur lors de la création du dossier', 'negative')
            return false
        }
    }

    const renameItem = async (item: FileSystemItem, newName: string) => {
        try {
            let success = false
            if (item.type === 'document') {
                success = await documentService.renameDocument(item.id, newName)
            } else {
                success = await documentService.renameFolder(item.id, newName)
            }
            
            if (success) {
                const existingItem = items.value.find(i => i.id === item.id && i.type === item.type)
                if (existingItem) {
                    existingItem.name = newName
                }
                notificationsStore.notify('Élément renommé avec succès', 'positive')
            }
            return success
        } catch (error) {
            console.error('Erreur lors du renommage:', error)
            notificationsStore.notify('Erreur lors du renommage', 'negative')
            return false
        }
    }

    const deleteItems = async (itemsToDelete: FileSystemItem[]) => {
        try {
            const promises = itemsToDelete.map(item => {
                if (item.type === 'document') {
                    return documentService.deleteDocument(item.id)
                } else {
                    return documentService.deleteFolder(item.id)
                }
            })
            
            await Promise.all(promises)
            
            // Update local state
            items.value = items.value.filter(item => 
                !itemsToDelete.some(i => i.id === item.id && i.type === item.type)
            )
            selectedItems.value = selectedItems.value.filter(item =>
                !itemsToDelete.some(i => i.id === item.id && i.type === item.type)
            )
            
            notificationsStore.notify(
                itemsToDelete.length > 1 
                    ? 'Éléments supprimés avec succès'
                    : 'Élément supprimé avec succès',
                'positive'
            )
            return true
        } catch (error) {
            console.error('Erreur lors de la suppression:', error)
            notificationsStore.notify('Erreur lors de la suppression', 'negative')
            return false
        }
    }

    const moveItems = async (itemsToMove: FileSystemItem[], targetFolderId: string) => {
        try {
            const success = await documentService.moveItems(itemsToMove, targetFolderId)
            if (success) {
                // Update local state while maintaining hierarchy
                const updateItemsAfterMove = (items: FileSystemItem[]) => {
                    itemsToMove.forEach(item => {
                        const index = items.findIndex(i => i.id === item.id && i.type === item.type)
                        if (index !== -1) {
                            const movedItem = items[index]
                            movedItem.parentId = targetFolderId
                            items.splice(index, 1)

                            // Find the target folder and add the moved item to its children
                            const addMovedItemToTarget = (folders: FileSystemItem[], targetFolderId: string, movedItem: FileSystemItem): boolean => {
                                if (targetFolderId === 'root') {
                                    folders.push(movedItem)
                                    return true
                                }
                                
                                const targetFolder = folders.find(folder => folder.type === 'folder' && folder.id === targetFolderId) as Folder | undefined
                                if (targetFolder) {
                                    if (!targetFolder.children) {
                                        targetFolder.children = []
                                    }
                                    targetFolder.children.push(movedItem)
                                    return true
                                }
                                
                                // Search recursively in children to find the correct target folder
                                for (const folder of folders) {
                                    if (folder.type === 'folder' && folder.children) {
                                        if (addMovedItemToTarget(folder.children, targetFolderId, movedItem)) {
                                            return true
                                        }
                                    }
                                }
                                return false
                            }

                            addMovedItemToTarget(items, targetFolderId, movedItem)
                        }
                    })
                }

                const itemsCopy = [...items.value]
                updateItemsAfterMove(itemsCopy)
                items.value = itemsCopy

                selectedItems.value = []
                notificationsStore.notify('Éléments déplacés avec succès', 'positive')
            }
            return success
        } catch (error) {
            console.error('Erreur lors du déplacement:', error)
            notificationsStore.notify('Erreur lors du déplacement', 'negative')
            return false
        }
    }

    const navigateToFolder = (folderId: string) => {
        currentPath.value.push(folderId)
        fetchItems(folderId)
    }

    const navigateBack = () => {
        if (currentPath.value.length > 1) {
            currentPath.value.pop()
            const parentId = currentPath.value[currentPath.value.length - 1]
            fetchItems(parentId)
        }
    }

    // Initialize
    fetchItems()

    return {
        items,
        selectedItems,
        loading,
        currentPath,
        fetchItems,
        toggleActivation,
        setIndexed,
        createFolder,
        renameItem,
        deleteItems,
        moveItems,
        navigateToFolder,
        navigateBack
    }
})