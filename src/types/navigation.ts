export interface PathNode {
    id: string
    name: string
    type: 'folder' | 'root'
    parentId: string | null
}

export interface NavigationState {
    currentPath: PathNode[]
    selectedItems: string[]
}