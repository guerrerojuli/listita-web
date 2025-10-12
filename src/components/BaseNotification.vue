<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  modelValue?: boolean
  variant?: 'filled' | 'text' // filled = with background (for toasts), text = text only (for modals)
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: true,
  variant: 'filled',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const notificationConfig = computed(() => {
  switch (props.type) {
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
  }
})

function handleClose() {
  emit('update:modelValue', false)
}
</script>

<template>
  <Transition name="notification-slide">
    <div
      v-if="modelValue"
      :class="['base-notification', `notification-${variant}`]"
      :style="
        variant === 'filled'
          ? {
              backgroundColor: notificationConfig.bgColor,
              color: notificationConfig.textColor,
            }
          : {}
      "
    >
      <div class="notification-content">
        <v-icon
          :icon="notificationConfig.icon"
          :color="notificationConfig.iconColor"
          :size="variant === 'text' ? 18 : 20"
        />
        <span
          class="notification-message"
          :style="variant === 'text' ? { color: notificationConfig.textColor } : {}"
          >{{ message }}</span
        >
      </div>
      <v-btn
        v-if="variant === 'filled'"
        icon="mdi-close"
        variant="text"
        size="x-small"
        class="notification-close"
        @click="handleClose"
      />
    </div>
  </Transition>
</template>

<style scoped>
.base-notification {
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
}

.notification-filled {
  padding: 0.875rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.notification-text {
  padding: 0;
  margin: 0;
  justify-content: flex-start;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.notification-text .notification-content {
  gap: 0.5rem;
}

.notification-message {
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.4;
}

.notification-text .notification-message {
  font-size: 0.8125rem;
  font-weight: 500;
}

.notification-close {
  opacity: 0.7;
  transition: opacity 0.2s ease;
  flex-shrink: 0;
}

.notification-close:hover {
  opacity: 1;
}

.notification-slide-enter-active,
.notification-slide-leave-active {
  transition: all 0.3s ease;
}

.notification-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.notification-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
