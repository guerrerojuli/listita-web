<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'danger' | 'success'
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'default',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

const show = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

function handleConfirm() {
  emit('confirm')
  show.value = false
}

function handleCancel() {
  emit('cancel')
  show.value = false
}

const confirmButtonClass = computed(() => {
  switch (props.variant) {
    case 'danger':
      return 'btn-remove'
    case 'success':
      return 'btn-add'
    default:
      return 'btn-add'
  }
})
</script>

<template>
  <v-dialog v-model="show" max-width="450" persistent>
    <v-card class="confirm-dialog">
      <div class="dialog-header">
        <h2 class="dialog-title">{{ title }}</h2>
        <v-btn icon="mdi-close" variant="text" size="small" @click="handleCancel" />
      </div>

      <v-card-text class="dialog-content">
        <p class="dialog-message">{{ message }}</p>
      </v-card-text>

      <v-card-actions class="dialog-actions">
        <v-btn class="btn-cancel" elevation="0" @click="handleCancel">
          {{ cancelText }}
        </v-btn>
        <v-btn :class="confirmButtonClass" elevation="0" @click="handleConfirm">
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.confirm-dialog {
  border-radius: 12px;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 1rem 1.5rem;
}

.dialog-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #000;
  margin: 0;
}

.dialog-content {
  padding: 0 1.5rem 1.5rem 1.5rem !important;
}

.dialog-message {
  font-size: 1rem;
  color: #424242;
  line-height: 1.5;
  margin: 0;
}

.dialog-actions {
  padding: 1.5rem !important;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-cancel {
  background-color: #e0e0e0 !important;
  color: #424242 !important;
  text-transform: none;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 6px;
  padding: 0.5rem 1.5rem !important;
}

.btn-add {
  background-color: #000 !important;
  color: white !important;
  text-transform: none;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 6px;
  padding: 0.5rem 1.5rem !important;
}

.btn-remove {
  background-color: #f44336 !important;
  color: white !important;
  text-transform: none;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 6px;
  padding: 0.5rem 1.5rem !important;
}
</style>
