import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DocumentActivationCell from '@/components/document/cells/DocumentActivationCell.vue'

describe('DocumentActivationCell', () => {
    it('renders active state correctly', () => {
        const wrapper = mount(DocumentActivationCell, {
            props: {
                value: true
            }
        })
        expect(wrapper.find('.q-btn').classes()).toContain('text-positive')
        expect(wrapper.find('.q-icon').attributes('name')).toBe('check_circle')
    })

    it('renders inactive state correctly', () => {
        const wrapper = mount(DocumentActivationCell, {
            props: {
                value: false
            }
        })
        expect(wrapper.find('.q-btn').classes()).toContain('text-grey-7')
        expect(wrapper.find('.q-icon').attributes('name')).toBe('cancel')
    })

    it('emits toggle event when clicked', async () => {
        const wrapper = mount(DocumentActivationCell, {
            props: {
                value: true
            }
        })
        await wrapper.find('.q-btn').trigger('click')
        expect(wrapper.emitted('update:value')).toBeTruthy()
        expect(wrapper.emitted('update:value')?.[0]).toEqual([false])
    })

    it('shows correct tooltip text', async () => {
        const wrapper = mount(DocumentActivationCell, {
            props: {
                value: true
            }
        })
        await wrapper.find('.q-btn').trigger('mouseenter')
        expect(document.body.textContent).toContain('Désactiver')

        await wrapper.setProps({ value: false })
        await wrapper.find('.q-btn').trigger('mouseenter')
        expect(document.body.textContent).toContain('Activer')
    })
})