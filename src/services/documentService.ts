import type { Document, IndexationResult, DocumentMetadata, Folder, FileSystemItem } from '@/types/document'

class DocumentService {
    private baseUrl: string = import.meta.env.VITE_API_URL || ''
    private mockDocuments: Document[] = [
        {
            id: '1',
            name: 'Rapport Annuel 2023.pdf',
            active: true,
            createdAt: '2024-01-15',
            size: 2.5,
            pages: 45,
            tokens: 15000,
            indexed: false,
            type: 'document',
            parentId: 'folder1'
        },
        {
            id: '2',
            name: 'Guide Utilisateur v2.pdf',
            active: true,
            createdAt: '2024-02-01',
            size: 4.2,
            pages: 120,
            tokens: 35000,
            indexed: false,
            type: 'document',
            parentId: 'folder1'
        },
        {
            id: '3',
            name: 'Documentation API.pdf',
            active: true,
            createdAt: '2024-03-01',
            size: 5.8,
            pages: 150,
            tokens: 45000,
            indexed: false,
            type: 'document',
            parentId: 'root'
        }
    ]

    private mockFolders: Folder[] = [
        {
            id: 'folder1',
            name: 'Documents Techniques',
            createdAt: '2024-03-01',
            type: 'folder',
            parentId: 'root',
            statistics: {
                totalSize: 6.7,
                totalPages: 165,
                totalTokens: 50000,
                indexedCount: 0,
                totalCount: 2
            }
        }
    ]

    private updateFolderStatistics(folderId: string) {
        const folderIndex = this.mockFolders.findIndex(f => f.id === folderId)
        if (folderIndex === -1) return

        const documents = this.mockDocuments.filter(d => d.parentId === folderId)
        this.mockFolders[folderIndex].statistics = {
            totalSize: Number(documents.reduce((sum, doc) => sum + doc.size, 0).toFixed(1)),
            totalPages: documents.reduce((sum, doc) => sum + doc.pages, 0),
            totalTokens: documents.reduce((sum, doc) => sum + doc.tokens, 0),
            indexedCount: documents.filter(doc => doc.indexed).length,
            totalCount: documents.length
        }
    }

    async fetchItems(parentId: string = 'root'): Promise<FileSystemItem[]> {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Update all folder statistics before returning items
        this.mockFolders.forEach(folder => {
            this.updateFolderStatistics(folder.id)
        })
        
        const folders = this.mockFolders.filter(f => f.parentId === parentId)
        const documents = this.mockDocuments.filter(d => d.parentId === parentId)
        return [...folders, ...documents]
    }

    async toggleActivation(id: string): Promise<{ success: boolean; active: boolean }> {
        await new Promise(resolve => setTimeout(resolve, 300))
        const docIndex = this.mockDocuments.findIndex(d => d.id === id)
        if (docIndex !== -1) {
            this.mockDocuments[docIndex].active = !this.mockDocuments[docIndex].active
            return {
                success: true,
                active: this.mockDocuments[docIndex].active
            }
        }
        return {
            success: false,
            active: false
        }
    }

    async indexFolder(folderId: string): Promise<Document[]> {
        await new Promise(resolve => setTimeout(resolve, 300))
        const documents = this.mockDocuments
            .filter(doc => doc.parentId === folderId && !doc.indexed)
            .map(doc => ({...doc}))
        
        if (documents.length === 0) {
            throw new Error('Aucun document à indexer dans ce dossier')
        }
        
        return documents.sort((a, b) => a.id.localeCompare(b.id))
    }

    async indexDocument(id: string): Promise<IndexationResult> {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 2000))
        const docIndex = this.mockDocuments.findIndex(d => d.id === id)
        if (docIndex !== -1) {
            this.mockDocuments[docIndex].indexed = true
            
            // Update folder statistics
            const parentId = this.mockDocuments[docIndex].parentId
            if (parentId) {
                this.updateFolderStatistics(parentId)
            }
            
            return {
                success: true,
                executionTime: Number((Math.random() * 2 + 1).toFixed(1)),
                pages: this.mockDocuments[docIndex].pages,
                tokens: this.mockDocuments[docIndex].tokens,
                size: this.mockDocuments[docIndex].size
            }
        }
        return {
            success: false,
            executionTime: 0
        }
    }

    async deleteDocument(id: string): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, 300))
        const index = this.mockDocuments.findIndex(d => d.id === id)
        if (index !== -1) {
            const parentId = this.mockDocuments[index].parentId
            this.mockDocuments.splice(index, 1)
            if (parentId) {
                this.updateFolderStatistics(parentId)
            }
            return true
        }
        return false
    }

    async deleteFolder(id: string): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, 300))
        const index = this.mockFolders.findIndex(f => f.id === id)
        if (index !== -1) {
            // Delete all documents in folder
            this.mockDocuments = this.mockDocuments.filter(d => d.parentId !== id)
            // Delete folder
            this.mockFolders.splice(index, 1)
            return true
        }
        return false
    }

    async renameDocument(id: string, newName: string): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, 300))
        const doc = this.mockDocuments.find(d => d.id === id)
        if (doc) {
            doc.name = newName
            return true
        }
        return false
    }

    async renameFolder(id: string, newName: string): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, 300))
        const folder = this.mockFolders.find(f => f.id === id)
        if (folder) {
            folder.name = newName
            return true
        }
        return false
    }

    async createFolder(name: string, parentId: string = 'root'): Promise<Folder> {
        await new Promise(resolve => setTimeout(resolve, 300))
        const newFolder: Folder = {
            id: `folder${Date.now()}`,
            name,
            createdAt: new Date().toISOString(),
            type: 'folder',
            parentId,
            statistics: {
                totalSize: 0,
                totalPages: 0,
                totalTokens: 0,
                indexedCount: 0,
                totalCount: 0
            }
        }
        this.mockFolders.push(newFolder)
        return newFolder
    }

    async moveItems(items: FileSystemItem[], targetFolderId: string): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, 500))
        try {
            items.forEach(item => {
                if (item.type === 'document') {
                    const doc = this.mockDocuments.find(d => d.id === item.id)
                    if (doc) {
                        const oldParentId = doc.parentId
                        doc.parentId = targetFolderId
                        if (oldParentId) {
                            this.updateFolderStatistics(oldParentId)
                        }
                    }
                } else {
                    const folder = this.mockFolders.find(f => f.id === item.id)
                    if (folder) {
                        folder.parentId = targetFolderId
                    }
                }
            })
            
            // Update target folder statistics
            if (targetFolderId !== 'root') {
                this.updateFolderStatistics(targetFolderId)
            }
            
            return true
        } catch (error) {
            console.error('Error moving items:', error)
            return false
        }
    }
}

export const documentService = new DocumentService()