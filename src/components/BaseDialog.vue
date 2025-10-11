<script setup lang="ts">
interface Props {
  modelValue: boolean
  title: string
  maxWidth?: string | number
  persistent?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxWidth: 500,
  persistent: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function handleClose() {
  emit('update:modelValue', false)
}
</script>

<template>
  <v-dialog
    :model-value="props.modelValue"
    :max-width="props.maxWidth"
    :persistent="props.persistent"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="base-dialog">
      <div class="dialog-header">
        <h2 class="dialog-title">{{ props.title }}</h2>
        <v-btn icon="mdi-close" variant="text" size="small" @click="handleClose" />
      </div>

      <v-card-text class="dialog-content">
        <slot />
      </v-card-text>

      <v-card-actions v-if="$slots.actions" class="dialog-actions">
        <slot name="actions" :close="handleClose" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.base-dialog {
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

.dialog-actions {
  padding: 1.5rem !important;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.dialog-actions :deep(.btn-cancel) {
  background-color: #e0e0e0 !important;
  color: #424242 !important;
  text-transform: none;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 6px;
  padding: 0.5rem 1.5rem !important;
}

.dialog-actions :deep(.btn-add),
.dialog-actions :deep(.btn-primary) {
  background-color: #000 !important;
  color: white !important;
  text-transform: none;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 6px;
  padding: 0.5rem 1.5rem !important;
}

.dialog-actions :deep(.btn-remove),
.dialog-actions :deep(.btn-danger) {
  background-color: #f44336 !important;
  color: white !important;
  text-transform: none;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 6px;
  padding: 0.5rem 1.5rem !important;
}
</style>
