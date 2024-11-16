import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DocumentIndexationCell from '@/components/document/cells/DocumentIndexationCell.vue'

describe('DocumentIndexationCell', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    it('shows progress indicator when indexing', () => {
        const wrapper = mount(DocumentIndexationCell, {
            props: {
                value: false,
                isIndexing: true
            }
        })

        expect(wrapper.find('.q-circular-progress').exists()).toBe(true)
    })

    it('shows status button when not indexing', () => {
        const wrapper = mount(DocumentIndexationCell, {
            props: {
                value: false,
                isIndexing: false
            }
        })

        expect(wrapper.find('.indexation-btn').exists()).toBe(true)
    })

    it('shows execution time in tooltip when indexed', async () => {
        const wrapper = mount(DocumentIndexationCell, {
            props: {
                value: true,
                isIndexing: false,
                executionTime: 2.5
            }
        })

        await wrapper.find('.indexation-btn').trigger('mouseenter')
        expect(document.body.textContent).toContain('Indexé en 2.5s')
    })

    it('shows non-indexed status in tooltip', async () => {
        const wrapper = mount(DocumentIndexationCell, {
            props: {
                value: false,
                isIndexing: false
            }
        })

        await wrapper.find('.indexation-btn').trigger('mouseenter')
        expect(document.body.textContent).toContain('Non indexé')
    })

    it('updates progress during indexation', async () => {
        const wrapper = mount(DocumentIndexationCell, {
            props: {
                value: false,
                isIndexing: true
            }
        })

        // Initial progress
        expect(wrapper.vm.progress).toBe(0)

        // Advance time to see progress increase
        await vi.advanceTimersByTime(1000)
        expect(wrapper.vm.progress).toBeGreaterThan(0)
        expect(wrapper.vm.progress).toBeLessThan(95)

        // Complete indexation
        await vi.advanceTimersByTime(5000)
        expect(wrapper.vm.progress).toBe(100)
    })

    it('emits completion event after indexation', async () => {
        const wrapper = mount(DocumentIndexationCell, {
            props: {
                value: false,
                isIndexing: true
            }
        })

        // Wait for indexation to complete
        await vi.advanceTimersByTime(5200)
        
        expect(wrapper.emitted('indexation-complete')).toBeTruthy()
        const emittedTime = wrapper.emitted('indexation-complete')[0][0]
        expect(typeof emittedTime).toBe('number')
        expect(emittedTime).toBeGreaterThan(0)
    })

    it('cleans up intervals on unmount', () => {
        const wrapper = mount(DocumentIndexationCell, {
            props: {
                value: false,
                isIndexing: true
            }
        })

        wrapper.unmount()
        
        // Ensure no more updates occur
        vi.advanceTimersByTime(5000)
        expect(wrapper.emitted('indexation-complete')).toBeFalsy()
    })
})