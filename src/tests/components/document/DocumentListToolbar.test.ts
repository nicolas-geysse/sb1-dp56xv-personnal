import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DocumentListToolbar from '@/components/document/DocumentListToolbar.vue'

describe('DocumentListToolbar', () => {
    const mockDocument = {
        id: '1',
        name: 'test.pdf',
        type: 'document',
        indexed: false,
        active: true,
        createdAt: '2024-03-14',
        size: 1.5,
        pages: 10,
        tokens: 1000,
        parentId: 'root'
    }

    const mockFolder = {
        id: 'folder1',
        name: 'Test Folder',
        type: 'folder',
        createdAt: '2024-03-14',
        parentId: 'root',
        statistics: {
            totalSize: 3.0,
            totalPages: 20,
            totalTokens: 2000,
            indexedCount: 0,
            totalCount: 2
        }
    }

    it('shows correct count for indexing documents', () => {
        const wrapper = mount(DocumentListToolbar, {
            props: {
                filter: '',
                selectedItems: [mockDocument, mockFolder]
            }
        })

        const indexBtn = wrapper.find('button:contains("Indexer")')
        expect(indexBtn.text()).toContain('(3)') // 1 document + 2 from folder
    })

    it('shows correct count for duplicating items', () => {
        const wrapper = mount(DocumentListToolbar, {
            props: {
                filter: '',
                selectedItems: [mockDocument, mockFolder]
            }
        })

        const duplicateBtn = wrapper.find('button:contains("Dupliquer")')
        expect(duplicateBtn.text()).toContain('(4)') // 1 document + folder itself + 2 folder documents
    })

    it('shows correct count for downloading documents', () => {
        const wrapper = mount(DocumentListToolbar, {
            props: {
                filter: '',
                selectedItems: [mockDocument, mockFolder]
            }
        })

        const downloadBtn = wrapper.find('button:contains("Télécharger")')
        expect(downloadBtn.text()).toContain('(3)') // 1 document + 2 from folder
    })

    it('disables index button when no documents to index', () => {
        const indexedDoc = { ...mockDocument, indexed: true }
        const indexedFolder = {
            ...mockFolder,
            statistics: {
                ...mockFolder.statistics,
                indexedCount: 2
            }
        }

        const wrapper = mount(DocumentListToolbar, {
            props: {
                filter: '',
                selectedItems: [indexedDoc, indexedFolder]
            }
        })

        const indexBtn = wrapper.find('button:contains("Indexer")')
        expect(indexBtn.attributes('disabled')).toBeDefined()
    })

    it('shows dropdown menu with correct options', async () => {
        const wrapper = mount(DocumentListToolbar, {
            props: {
                filter: '',
                selectedItems: []
            }
        })

        await wrapper.find('.q-btn-dropdown').trigger('click')

        const menuItems = wrapper.findAll('.custom-menu-item')
        expect(menuItems).toHaveLength(2)
        expect(menuItems[0].text()).toContain('Nouveau document')
        expect(menuItems[1].text()).toContain('Nouveau dossier')
    })

    it('emits filter update when search input changes', async () => {
        const wrapper = mount(DocumentListToolbar, {
            props: {
                filter: '',
                selectedItems: []
            }
        })

        await wrapper.find('.search-input input').setValue('test')
        expect(wrapper.emitted('update:filter')).toBeTruthy()
        expect(wrapper.emitted('update:filter')[0]).toEqual(['test'])
    })
})