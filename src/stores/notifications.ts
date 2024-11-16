import { defineStore } from 'pinia'
import { useQuasar } from 'quasar'

export const useNotificationsStore = defineStore('notifications', () => {
    const $q = useQuasar()

    const notify = (message: string, type: 'positive' | 'negative' | 'warning' | 'info' = 'info') => {
        $q.notify({
            message,
            color: type,
            position: 'top',
            timeout: 2500,
            textColor: 'white',
            classes: `notification-${type}`
        })
    }

    const showConfirmDialog = (options: {
        title: string
        message: string
        okLabel?: string
        cancelLabel?: string
        persistent?: boolean
    }): Promise<boolean> => {
        return new Promise((resolve) => {
            $q.dialog({
                title: options.title,
                message: options.message,
                ok: {
                    label: options.okLabel || 'Confirmer',
                    flat: true,
                    color: 'primary'
                },
                cancel: {
                    label: options.cancelLabel || 'Annuler',
                    flat: true,
                    color: 'grey-7'
                },
                persistent: options.persistent ?? true,
                dark: true,
                class: 'custom-dialog'
            }).onOk(() => {
                resolve(true)
            }).onCancel(() => {
                resolve(false)
            })
        })
    }

    return {
        notify,
        showConfirmDialog
    }
})