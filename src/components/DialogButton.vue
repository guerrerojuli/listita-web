<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'danger' | 'cancel'
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  disabled: false,
  loading: false
})

const buttonClass = computed(() => {
  switch (props.variant) {
    case 'primary': return 'btn-add'
    case 'danger': return 'btn-remove'
    case 'cancel': return 'btn-cancel'
    default: return 'btn-add'
  }
})
</script>

<template>
  <v-btn
    :class="buttonClass"
    :disabled="disabled"
    :loading="loading"
    elevation="0"
    v-bind="$attrs"
  >
    <slot />
  </v-btn>
</template>

<style scoped>
.btn-add {
  background-color: #000 !important;
  color: white !important;
  text-transform: none;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 6px;
  padding: 0.5rem 1.5rem !important;
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

.btn-remove {
  background-color: #e53935 !important;
  color: white !important;
  text-transform: none;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 6px;
  padding: 0.5rem 1.5rem !important;
}

.btn-remove:hover {
  background-color: #c62828 !important;
}
</style>
