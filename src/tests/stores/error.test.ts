import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useErrorStore } from '@/stores/error'
import { useNotificationsStore } from '@/stores/notifications'

vi.mock('@/stores/notifications', () => ({
    useNotificationsStore: () => ({
        notify: vi.fn()
    })
}))

describe('Error Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        vi.clearAllMocks()
    })

    describe('addError', () => {
        it('should add error and show notification', () => {
            const store = useErrorStore()
            const notificationsStore = useNotificationsStore()

            const errorId = store.addError({
                message: 'Test error',
                type: 'error'
            })

            expect(store.errors).toHaveLength(1)
            expect(store.lastError).not.toBeNull()
            expect(store.lastError?.message).toBe('Test error')
            expect(notificationsStore.notify).toHaveBeenCalledWith('Test error', 'negative')
            expect(typeof errorId).toBe('string')
        })

        it('should add warning and show notification', () => {
            const store = useErrorStore()
            const notificationsStore = useNotificationsStore()

            store.addError({
                message: 'Test warning',
                type: 'warning'
            })

            expect(store.errors).toHaveLength(1)
            expect(store.lastError?.type).toBe('warning')
            expect(notificationsStore.notify).toHaveBeenCalledWith('Test warning', 'warning')
        })
    })

    describe('removeError', () => {
        it('should remove error by id', () => {
            const store = useErrorStore()
            const errorId = store.addError({
                message: 'Test error',
                type: 'error'
            })

            store.removeError(errorId)
            expect(store.errors).toHaveLength(0)
            expect(store.lastError).toBeNull()
        })

        it('should update lastError when removing current lastError', () => {
            const store = useErrorStore()
            const error1Id = store.addError({
                message: 'Error 1',
                type: 'error'
            })
            const error2Id = store.addError({
                message: 'Error 2',
                type: 'error'
            })

            store.removeError(error2Id)
            expect(store.lastError?.id).toBe(error1Id)
        })
    })

    describe('clearErrors', () => {
        it('should clear all errors', () => {
            const store = useErrorStore()
            store.addError({ message: 'Error 1', type: 'error' })
            store.addError({ message: 'Error 2', type: 'error' })

            store.clearErrors()
            expect(store.errors).toHaveLength(0)
            expect(store.lastError).toBeNull()
        })
    })

    describe('hasErrors', () => {
        it('should check for specific error type', () => {
            const store = useErrorStore()
            store.addError({ message: 'Warning', type: 'warning' })
            store.addError({ message: 'Error', type: 'error' })

            expect(store.hasErrors('error')).toBe(true)
            expect(store.hasErrors('warning')).toBe(true)
        })

        it('should check for any errors', () => {
            const store = useErrorStore()
            expect(store.hasErrors()).toBe(false)

            store.addError({ message: 'Warning', type: 'warning' })
            expect(store.hasErrors()).toBe(true)
        })
    })
})