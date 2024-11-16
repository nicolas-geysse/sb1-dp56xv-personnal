import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DocumentBreadcrumb from '@/components/document/DocumentBreadcrumb.vue'

describe('DocumentBreadcrumb', () => {
    const mockPath = [
        { id: 'root', name: 'Documents', type: 'root', parentId: null },
        { id: 'folder1', name: 'Dossier 1', type: 'folder', parentId: 'root' },
        { id: 'folder2', name: 'Dossier 2', type: 'folder', parentId: 'folder1' }
    ]

    it('renders all path nodes', () => {
        const wrapper = mount(DocumentBreadcrumb, {
            props: {
                path: mockPath
            }
        })

        const nodes = wrapper.findAll('.q-breadcrumbs__el')
        expect(nodes).toHaveLength(3)
        expect(nodes[0].text()).toBe('Documents')
        expect(nodes[1].text()).toBe('Dossier 1')
        expect(nodes[2].text()).toBe('Dossier 2')
    })

    it('highlights current node', () => {
        const wrapper = mount(DocumentBreadcrumb, {
            props: {
                path: mockPath
            }
        })

        const nodes = wrapper.findAll('.q-breadcrumbs__el')
        expect(nodes[2].classes()).toContain('text-primary')
    })

    it('emits navigate event when clicking on node', async () => {
        const wrapper = mount(DocumentBreadcrumb, {
            props: {
                path: mockPath
            }
        })

        await wrapper.findAll('.q-breadcrumbs__el')[1].trigger('click')
        
        expect(wrapper.emitted('navigate')).toBeTruthy()
        expect(wrapper.emitted('navigate')[0]).toEqual([mockPath[1]])
    })

    it('renders separator between nodes', () => {
        const wrapper = mount(DocumentBreadcrumb, {
            props: {
                path: mockPath
            }
        })

        expect(wrapper.find('.q-breadcrumbs').attributes('separator')).toBe('/')
    })
})