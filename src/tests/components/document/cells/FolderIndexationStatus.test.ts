import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import FolderIndexationStatus from '@/components/document/cells/FolderIndexationStatus.vue'

describe('FolderIndexationStatus', () => {
    const mockStatistics = {
        totalSize: 3.0,
        totalPages: 20,
        totalTokens: 2000,
        indexedCount: 0,
        totalCount: 2
    }

    it('shows grey icon when folder is empty', () => {
        const wrapper = mount(FolderIndexationStatus, {
            props: {
                statistics: {
                    ...mockStatistics,
                    totalCount: 0
                }
            }
        })
        
        const btn = wrapper.find('.folder-status-btn')
        expect(btn.classes()).toContain('text-grey-7')
        expect(wrapper.find('.q-tooltip').text()).toBe('Dossier vide')
    })

    it('shows warning icon when some documents are indexed', () => {
        const wrapper = mount(FolderIndexationStatus, {
            props: {
                statistics: {
                    ...mockStatistics,
                    indexedCount: 1,
                    totalCount: 2
                }
            }
        })
        
        const btn = wrapper.find('.folder-status-btn')
        expect(btn.classes()).toContain('text-warning')
        expect(wrapper.find('.q-tooltip').text()).toBe('1/2 documents indexés')
    })

    it('shows success icon when all documents are indexed', () => {
        const wrapper = mount(FolderIndexationStatus, {
            props: {
                statistics: {
                    ...mockStatistics,
                    indexedCount: 2,
                    totalCount: 2
                }
            }
        })
        
        const btn = wrapper.find('.folder-status-btn')
        expect(btn.classes()).toContain('text-positive')
        expect(wrapper.find('.q-tooltip').text()).toBe('Tous les documents sont indexés')
    })

    it('shows indexing progress when folder is being indexed', () => {
        const wrapper = mount(FolderIndexationStatus, {
            props: {
                statistics: mockStatistics,
                isIndexing: true,
                currentFile: 1,
                totalFiles: 2
            }
        })
        
        expect(wrapper.find('.q-circular-progress').exists()).toBe(true)
        expect(wrapper.find('.indexing-info').text()).toBe('1/2')
    })
})