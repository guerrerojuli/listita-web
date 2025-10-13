<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'cancel' | 'create-category'
  disabled?: boolean
  loading?: boolean
  size?: 'small' | 'default' | 'large'
  elevation?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  disabled: false,
  loading: false,
  size: 'default',
  elevation: 0
})

const buttonClass = computed(() => {
  switch (props.variant) {
    case 'primary': return 'btn-add'
    case 'secondary': return 'btn-secondary'
    case 'danger': return 'btn-remove'
    case 'cancel': return 'btn-cancel'
    case 'create-category': return 'btn-create-category'
    default: return 'btn-add'
  }
})
</script>

<template>
  <v-btn
    :class="buttonClass"
    :disabled="disabled"
    :loading="loading"
    :elevation="elevation"
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

.btn-add:hover {
  background-color: #1a1a1a !important;
  color: white !important;
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

.btn-create-category {
  background-color: #000 !important;
  color: white !important;
  text-transform: none;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 6px;
  padding: 0 1.5rem !important;
}

.btn-create-category:hover {
  background-color: #1a1a1a !important;
}

.btn-secondary {
  background-color: #f5f5f5 !important;
  color: #424242 !important;
  text-transform: none;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 6px;
  padding: 0.5rem 1.5rem !important;
}
</style>
