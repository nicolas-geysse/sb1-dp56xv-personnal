import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

export const useUIStore = defineStore('ui', () => {
    const $q = useQuasar()
    const isMobileView = computed(() => $q.screen.width < 1200)
    const showCreateFolderDialog = ref(false)
    const showRenameDialog = ref(false)
    const showDetailsDrawer = ref(false)

    const toggleCreateFolderDialog = (value?: boolean) => {
        showCreateFolderDialog.value = value ?? !showCreateFolderDialog.value
    }

    const toggleRenameDialog = (value?: boolean) => {
        showRenameDialog.value = value ?? !showRenameDialog.value
    }

    const toggleDetailsDrawer = (value?: boolean) => {
        showDetailsDrawer.value = value ?? !showDetailsDrawer.value
    }

    return {
        isMobileView,
        showCreateFolderDialog,
        showRenameDialog,
        showDetailsDrawer,
        toggleCreateFolderDialog,
        toggleRenameDialog,
        toggleDetailsDrawer
    }
})