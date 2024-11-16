import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DocumentCard from '@/components/document/DocumentCard.vue'

describe('DocumentCard', () => {
    const mockDocument = {
        id: 1,
        name: 'test.pdf',
        active: true,
        createdAt: '2024-03-14',
        size: 1.5,
        pages: 10,
        tokens: 1000,
        indexed: false
    }

    it('renders document name correctly', () => {
        const wrapper = mount(DocumentCard, {
            props: {
                row: mockDocument,
                selected: false,
                isIndexing: false
            }
        })
        expect(wrapper.text()).toContain('test.pdf')
    })

    it('emits selection event when checkbox is clicked', async () => {
        const wrapper = mount(DocumentCard, {
            props: {
                row: mockDocument,
                selected: false,
                isIndexing: false
            }
        })
        await wrapper.find('.custom-checkbox').trigger('click')
        expect(wrapper.emitted('update:selected')).toBeTruthy()
    })

    it('emits open-drawer event when name is clicked', async () => {
        const wrapper = mount(DocumentCard, {
            props: {
                row: mockDocument,
                selected: false,
                isIndexing: false
            }
        })
        await wrapper.find('.document-name').trigger('click')
        expect(wrapper.emitted('open-drawer')).toBeTruthy()
        expect(wrapper.emitted('open-drawer')?.[0]).toEqual([mockDocument])
    })

    it('shows indexation progress when isIndexing is true', () => {
        const wrapper = mount(DocumentCard, {
            props: {
                row: mockDocument,
                selected: false,
                isIndexing: true
            }
        })
        expect(wrapper.find('.q-circular-progress').exists()).toBe(true)
    })
})