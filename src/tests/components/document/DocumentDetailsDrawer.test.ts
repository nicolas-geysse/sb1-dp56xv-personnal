import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DocumentDetailsDrawer from '@/components/document/DocumentDetailsDrawer.vue'

describe('DocumentDetailsDrawer', () => {
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

    it('renders document details when document is provided', () => {
        const wrapper = mount(DocumentDetailsDrawer, {
            props: {
                modelValue: true,
                document: mockDocument
            }
        })
        expect(wrapper.text()).toContain(mockDocument.name)
        expect(wrapper.text()).toContain('10') // pages
        expect(wrapper.text()).toContain('1.5') // size
        expect(wrapper.text()).toContain('1 000') // formatted tokens
    })

    it('emits close event when close button is clicked', async () => {
        const wrapper = mount(DocumentDetailsDrawer, {
            props: {
                modelValue: true,
                document: mockDocument
            }
        })
        await wrapper.find('.q-btn').trigger('click')
        expect(wrapper.emitted('update:modelValue')).toBeTruthy()
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
    })

    it('does not render content when no document is provided', () => {
        const wrapper = mount(DocumentDetailsDrawer, {
            props: {
                modelValue: true,
                document: null
            }
        })
        expect(wrapper.find('.drawer-content').exists()).toBe(false)
    })

    it('formats date correctly', () => {
        const wrapper = mount(DocumentDetailsDrawer, {
            props: {
                modelValue: true,
                document: mockDocument
            }
        })
        const formattedDate = new Date(mockDocument.createdAt).toLocaleDateString('fr-FR')
        expect(wrapper.text()).toContain(formattedDate)
    })
})