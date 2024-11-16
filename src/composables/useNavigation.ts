import { ref, computed } from 'vue'
import type { PathNode } from '@/types/navigation'

export function useNavigation() {
    const currentPath = ref<PathNode[]>([
        { id: 'root', name: 'Documents', type: 'root', parentId: null }
    ])

    const currentFolder = computed(() => {
        return currentPath.value[currentPath.value.length - 1]
    })

    const navigateTo = (node: PathNode) => {
        const index = currentPath.value.findIndex(n => n.id === node.id)
        if (index !== -1) {
            // If clicking on a node in the path, navigate back to that level
            currentPath.value = currentPath.value.slice(0, index + 1)
            return node
        } else {
            // Add new node to path
            currentPath.value = [...currentPath.value, node]
            return node
        }
    }

    const navigateToParent = () => {
        if (currentPath.value.length > 1) {
            const newPath = currentPath.value.slice(0, -1)
            currentPath.value = newPath
            return newPath[newPath.length - 1]
        }
        return currentPath.value[0]
    }

    const resetNavigation = () => {
        currentPath.value = [
            { id: 'root', name: 'Documents', type: 'root', parentId: null }
        ]
        return currentPath.value[0]
    }

    return {
        currentPath,
        currentFolder,
        navigateTo,
        navigateToParent,
        resetNavigation
    }
}