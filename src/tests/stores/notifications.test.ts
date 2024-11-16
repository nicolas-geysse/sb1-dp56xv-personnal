import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useNotificationsStore } from '@/stores/notifications'

describe('Notifications Store', () => {
    const mockQuasar = {
        notify: vi.fn(),
        dialog: vi.fn(() => ({
            onOk: (fn: () => void) => {
                fn()
                return { onCancel: vi.fn() }
            },
            onCancel: (fn: () => void) => {
                fn()
                return { onOk: vi.fn() }
            }
        }))
    }

    beforeEach(() => {
        setActivePinia(createPinia())
        vi.clearAllMocks()
    })

    it('should show notification with correct parameters', () => {
        const store = useNotificationsStore()
        store.notify('Test message', 'positive')

        expect(mockQuasar.notify).toHaveBeenCalledWith({
            message: 'Test message',
            color: 'positive',
            position: 'top',
            timeout: 2500,
            textColor: 'white',
            classes: 'notification-positive'
        })
    })

    it('should show confirmation dialog and resolve true on OK', async () => {
        const store = useNotificationsStore()
        const result = await store.showConfirmDialog({
            title: 'Test',
            message: 'Test message'
        })

        expect(result).toBe(true)
        expect(mockQuasar.dialog).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Test',
            message: 'Test message',
            dark: true,
            class: 'custom-dialog'
        }))
    })

    it('should show confirmation dialog and resolve false on Cancel', async () => {
        const store = useNotificationsStore()
        mockQuasar.dialog.mockImplementationOnce(() => ({
            onOk: vi.fn().mockReturnThis(),
            onCancel: (fn: () => void) => {
                fn()
                return { onOk: vi.fn() }
            }
        }))

        const result = await store.showConfirmDialog({
            title: 'Test',
            message: 'Test message'
        })

        expect(result).toBe(false)
    })
})