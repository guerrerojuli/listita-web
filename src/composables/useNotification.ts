import { reactive } from 'vue'

export interface Notification {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  timeout?: number
}

interface NotificationState {
  notifications: Notification[]
  nextId: number
}

const state = reactive<NotificationState>({
  notifications: [],
  nextId: 1,
})

export function useNotification() {
  function addNotification(
    type: Notification['type'],
    message: string,
    timeout: number = 4000,
  ): number {
    const id = state.nextId++
    const notification: Notification = {
      id,
      type,
      message,
      timeout,
    }

    state.notifications.push(notification)

    // Auto-remove after timeout
    if (timeout > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, timeout)
    }

    return id
  }

  function removeNotification(id: number) {
    const index = state.notifications.findIndex((n) => n.id === id)
    if (index > -1) {
      state.notifications.splice(index, 1)
    }
  }

  function showSuccess(message: string, timeout?: number) {
    return addNotification('success', message, timeout)
  }

  function showError(message: string, timeout?: number) {
    return addNotification('error', message, timeout)
  }

  function showWarning(message: string, timeout?: number) {
    return addNotification('warning', message, timeout)
  }

  function showInfo(message: string, timeout?: number) {
    return addNotification('info', message, timeout)
  }

  return {
    notifications: state.notifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
  }
}
