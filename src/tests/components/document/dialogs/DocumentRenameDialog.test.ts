import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DocumentRenameDialog from '@/components/document/dialogs/DocumentRenameDialog.vue'

describe('DocumentRenameDialog', () => {
    it('initializes with current document name', () => {
        const wrapper = mount(DocumentRenameDialog, {
            props: {
                modelValue: true,
                currentName: 'test.pdf'
            }
        })
        const input = wrapper.find('input')
        expect(input.element.value).toBe('test.pdf')
    })

    it('validates file extension', async () => {
        const wrapper = mount(DocumentRenameDialog, {
            props: {
                modelValue: true,
                currentName: 'test.pdf'
            }
        })
        const input = wrapper.find('input')
        
        await input.setValue('test.doc')
        expect(wrapper.find('.q-field--error').exists()).toBe(true)
        expect(wrapper.text()).toContain('extension ".pdf"')
    })

    it('validates empty name', async () => {
        const wrapper = mount(DocumentRenameDialog, {
            props: {
                modelValue: true,
                currentName: 'test.pdf'
            }
        })
        const input = wrapper.find('input')
        
        await input.setValue('')
        expect(wrapper.find('.q-field--error').exists()).toBe(true)
        expect(wrapper.text()).toContain('ne peut pas être vide')
    })

    it('emits rename event with valid name', async () => {
        const wrapper = mount(DocumentRenameDialog, {
            props: {
                modelValue: true,
                currentName: 'test.pdf'
            }
        })
        const input = wrapper.find('input')
        const submitButton = wrapper.findAll('.q-btn').filter(btn => btn.text() === 'Renommer')[0]
        
        await input.setValue('newname.pdf')
        await submitButton.trigger('click')
        
        expect(wrapper.emitted('rename')).toBeTruthy()
        expect(wrapper.emitted('rename')?.[0]).toEqual(['newname.pdf'])
    })

    it('closes dialog when cancel is clicked', async () => {
        const wrapper = mount(DocumentRenameDialog, {
            props: {
                modelValue: true,
                currentName: 'test.pdf'
            }
        })
        const cancelButton = wrapper.findAll('.q-btn').filter(btn => btn.text() === 'Annuler')[0]
        
        await cancelButton.trigger('click')
        expect(wrapper.emitted('update:modelValue')).toBeTruthy()
        expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
    })
})