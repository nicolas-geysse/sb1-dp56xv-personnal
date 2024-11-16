import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DocumentActionsCell from '@/components/document/cells/DocumentActionsCell.vue'

describe('DocumentActionsCell', () => {
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

    it('renders all action buttons', () => {
        const wrapper = mount(DocumentActionsCell, {
            props: {
                row: mockDocument
            }
        })
        const buttons = wrapper.findAll('.q-btn')
        expect(buttons).toHaveLength(6) // index, indexMethod, rename, duplicate, download, delete
    })

    it('disables index button when document is already indexed', () => {
        const wrapper = mount(DocumentActionsCell, {
            props: {
                row: { ...mockDocument, indexed: true }
            }
        })
        const indexButton = wrapper.findAll('.q-btn')[0]
        expect(indexButton.attributes('disabled')).toBeDefined()
    })

    it('emits correct events when buttons are clicked', async () => {
        const wrapper = mount(DocumentActionsCell, {
            props: {
                row: mockDocument
            }
        })
        const buttons = wrapper.findAll('.q-btn')

        // Test each action button
        await buttons[0].trigger('click')
        expect(wrapper.emitted('index')?.[0]).toEqual([mockDocument])

        await buttons[1].trigger('click')
        expect(wrapper.emitted('indexMethod')?.[0]).toEqual([mockDocument])

        await buttons[2].trigger('click')
        expect(wrapper.emitted('rename')?.[0]).toEqual([mockDocument])

        await buttons[3].trigger('click')
        expect(wrapper.emitted('duplicate')?.[0]).toEqual([mockDocument])

        await buttons[4].trigger('click')
        expect(wrapper.emitted('download')?.[0]).toEqual([mockDocument])

        await buttons[5].trigger('click')
        expect(wrapper.emitted('delete')?.[0]).toEqual([mockDocument])
    })

    it('shows tooltips with correct text', async () => {
        const wrapper = mount(DocumentActionsCell, {
            props: {
                row: mockDocument
            }
        })
        const buttons = wrapper.findAll('.q-btn')

        // Test tooltip for index button
        await buttons[0].trigger('mouseenter')
        expect(document.body.textContent).toContain('Indexer')

        // Test tooltip for rename button
        await buttons[2].trigger('mouseenter')
        expect(document.body.textContent).toContain('Renommer')
    })
})