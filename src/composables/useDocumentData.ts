import { ref, computed } from 'vue'
import type { Document, Folder, FileSystemItem, TableColumn } from '@/types/document'
import { documentService } from '@/services/documentService'

export function useDocumentData() {
    const items = ref<FileSystemItem[]>([])
    const selectedItems = ref<FileSystemItem[]>([])
    const loading = ref(false)

    const columns = computed<TableColumn[]>(() => [
        {
            name: 'name',
            required: true,
            label: 'Nom',
            align: 'left',
            field: 'name',
            sortable: true,
            style: 'width: 25%'
        },
        {
            name: 'type',
            required: true,
            label: 'Type',
            align: 'center',
            field: (row: FileSystemItem) => row.type === 'folder' ? 'Dossier' : 'Document',
            sortable: true,
            style: 'width: 10%'
        },
        {
            name: 'active',
            required: true,
            label: 'Activation',
            align: 'center',
            field: (row: FileSystemItem) => row.type === 'document' ? (row as Document).active : null,
            sortable: true,
            style: 'width: 10%'
        },
        {
            name: 'createdAt',
            required: true,
            label: 'Date de création',
            align: 'center',
            field: 'createdAt',
            sortable: true,
            style: 'width: 12%'
        },
        {
            name: 'size',
            required: true,
            label: 'Taille',
            align: 'right',
            field: (row: FileSystemItem) => row.type === 'document' ? (row as Document).size : (row as Folder).statistics.totalSize,
            sortable: true,
            style: 'width: 10%'
        },
        {
            name: 'pages',
            required: true,
            label: 'Pages',
            align: 'right',
            field: (row: FileSystemItem) => row.type === 'document' ? (row as Document).pages : (row as Folder).statistics.totalPages,
            sortable: true,
            style: 'width: 10%'
        },
        {
            name: 'tokens',
            required: true,
            label: 'Tokens',
            align: 'right',
            field: (row: FileSystemItem) => row.type === 'document' ? (row as Document).tokens : (row as Folder).statistics.totalTokens,
            sortable: true,
            style: 'width: 10%'
        },
        {
            name: 'indexed',
            required: true,
            label: 'Indexation',
            align: 'center',
            field: (row: FileSystemItem) => row.type === 'document' ? (row as Document).indexed : null,
            sortable: true,
            style: 'width: 12%'
        },
        {
            name: 'actions',
            required: true,
            label: 'Actions',
            align: 'center',
            field: 'actions',
            sortable: false,
            style: 'width: 11%'
        }
    ])

    const fetchItems = async (parentId: string = 'root') => {
        loading.value = true
        try {
            items.value = await documentService.fetchItems(parentId)
        } catch (error) {
            console.error('Erreur lors du chargement des éléments:', error)
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
            items.value.push(newFolder)
            return true
        } catch (error) {
            console.error('Erreur lors de la création du dossier:', error)
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
            }
            return success
        } catch (error) {
            console.error('Erreur lors du renommage:', error)
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
            items.value = items.value.filter(item => 
                !itemsToDelete.some(i => i.id === item.id && i.type === item.type)
            )
            selectedItems.value = selectedItems.value.filter(item =>
                !itemsToDelete.some(i => i.id === item.id && i.type === item.type)
            )
            return true
        } catch (error) {
            console.error('Erreur lors de la suppression:', error)
            return false
        }
    }

    const moveItems = async (itemsToMove: FileSystemItem[], targetFolderId: string) => {
        try {
            const success = await documentService.moveItems(itemsToMove, targetFolderId)
            if (success) {
                // Remove moved items from current view if target is different
                const currentFolder = items.value[0]?.parentId || 'root'
                if (currentFolder !== targetFolderId) {
                    items.value = items.value.filter(item =>
                        !itemsToMove.some(i => i.id === item.id && i.type === item.type)
                    )
                }
                selectedItems.value = []
            }
            return success
        } catch (error) {
            console.error('Erreur lors du déplacement:', error)
            return false
        }
    }

    // Initialisation
    fetchItems()

    return {
        items,
        columns,
        selectedItems,
        loading,
        fetchItems,
        toggleActivation,
        setIndexed,
        createFolder,
        renameItem,
        deleteItems,
        moveItems
    }
}