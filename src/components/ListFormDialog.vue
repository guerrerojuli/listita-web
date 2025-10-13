<script setup lang="ts">
import { computed } from 'vue'
import BaseDialog from './BaseDialog.vue'
import BaseInput from './BaseInput.vue'
import BaseTextarea from './BaseTextarea.vue'
import BaseNotification from './BaseNotification.vue'
import DialogButton from './DialogButton.vue'

interface Props {
  modelValue: boolean
  title: string
  name: string
  description: string
  recurring: boolean
  confirmText: string
  errorMessage?: string
  showRecurring?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  errorMessage: '',
  showRecurring: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:name': [value: string]
  'update:description': [value: string]
  'update:recurring': [value: boolean]
  confirm: []
}>()

const show = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const listName = computed({
  get: () => props.name,
  set: (value: string) => emit('update:name', value),
})

const listDescription = computed({
  get: () => props.description,
  set: (value: string) => emit('update:description', value),
})

const listRecurring = computed({
  get: () => props.recurring,
  set: (value: boolean) => emit('update:recurring', value),
})

function handleConfirm() {
  emit('confirm')
}
</script>

<template>
  <BaseDialog v-model="show" :title="title">
    <BaseInput v-model="listName" label="List name" autofocus @keyup.enter="handleConfirm" />
    <BaseTextarea
      v-model="listDescription"
      label="Description (optional)"
      class="mt-4"
      :maxlength="250"
      counter
      :rows="3"
    />
    <v-checkbox
      v-if="showRecurring"
      v-model="listRecurring"
      label="Recurring"
      color="primary"
      density="compact"
      hide-details
      class="mt-2"
    />

    <template #actions="{ close }">
      <div style="position: absolute; bottom: 80px; left: 24px; right: 24px">
        <BaseNotification
          v-if="errorMessage"
          variant="text"
          type="warning"
          :message="errorMessage"
          :model-value="!!errorMessage"
        />
      </div>
      <DialogButton variant="cancel" @click="close">Cancel</DialogButton>
      <DialogButton variant="primary" :disabled="!listName.trim()" @click="handleConfirm">
        {{ confirmText }}
      </DialogButton>
    </template>
  </BaseDialog>
</template>
