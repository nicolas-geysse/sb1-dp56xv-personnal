import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useNotificationsStore } from './notifications'

export interface AppError {
    id: string
    message: string
    type: 'error' | 'warning'
    timestamp: number
    details?: any
}

export const useErrorStore = defineStore('error', () => {
    const notificationsStore = useNotificationsStore()
    const errors = ref<AppError[]>([])
    const lastError = ref<AppError | null>(null)

    const addError = (error: Omit<AppError, 'id' | 'timestamp'>) => {
        const newError: AppError = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            ...error
        }

        errors.value.push(newError)
        lastError.value = newError

        // Afficher une notification pour l'erreur
        notificationsStore.notify(error.message, error.type === 'error' ? 'negative' : 'warning')

        return newError.id
    }

    const removeError = (id: string) => {
        const index = errors.value.findIndex(e => e.id === id)
        if (index !== -1) {
            errors.value.splice(index, 1)
            if (lastError.value?.id === id) {
                lastError.value = errors.value[errors.value.length - 1] || null
            }
        }
    }

    const clearErrors = () => {
        errors.value = []
        lastError.value = null
    }

    const hasErrors = (type?: 'error' | 'warning') => {
        if (type) {
            return errors.value.some(e => e.type === type)
        }
        return errors.value.length > 0
    }

    return {
        errors,
        lastError,
        addError,
        removeError,
        clearErrors,
        hasErrors
    }
})