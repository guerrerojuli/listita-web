<script setup lang="ts">
import { computed } from 'vue'
import { useNotification } from '@/composables/useNotification'

const { notifications, removeNotification } = useNotification()

const notificationConfig = (type: string) => {
  switch (type) {
    case 'success':
      return {
        icon: 'mdi-check-circle',
        bgColor: '#e8f5e9',
        textColor: '#2e7d32',
        iconColor: '#4caf50',
      }
    case 'error':
      return {
        icon: 'mdi-alert-circle',
        bgColor: '#ffebee',
        textColor: '#c62828',
        iconColor: '#e53935',
      }
    case 'warning':
      return {
        icon: 'mdi-alert',
        bgColor: '#fff3cd',
        textColor: '#856404',
        iconColor: '#ffa726',
      }
    case 'info':
      return {
        icon: 'mdi-information',
        bgColor: '#e3f2fd',
        textColor: '#1565c0',
        iconColor: '#2196f3',
      }
    default:
      return {
        icon: 'mdi-information',
        bgColor: '#f5f5f5',
        textColor: '#424242',
        iconColor: '#757575',
      }
  }
}
</script>

<template>
  <div class="notification-container">
    <TransitionGroup name="toast">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="toast-notification"
        :style="{
          backgroundColor: notificationConfig(notification.type).bgColor,
          color: notificationConfig(notification.type).textColor,
        }"
      >
        <div class="toast-content">
          <v-icon
            :icon="notificationConfig(notification.type).icon"
            :color="notificationConfig(notification.type).iconColor"
            size="22"
          />
          <span class="toast-message">{{ notification.message }}</span>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="x-small"
          class="toast-close"
          @click="removeNotification(notification.id)"
        />
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.notification-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
  pointer-events: none;
}

.toast-notification {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 300px;
  pointer-events: auto;
  transition: all 0.3s ease;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  flex: 1;
}

.toast-message {
  font-size: 0.9375rem;
  font-weight: 500;
  line-height: 1.4;
}

.toast-close {
  opacity: 0.7;
  transition: opacity 0.2s ease;
  flex-shrink: 0;
  margin-left: 0.5rem;
}

.toast-close:hover {
  opacity: 1;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100px) scale(0.8);
}

.toast-move {
  transition: transform 0.4s ease;
}
</style>
