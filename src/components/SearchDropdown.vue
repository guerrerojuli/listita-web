<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue: string
  placeholder?: string
  showDropdown?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'update:showDropdown', value: boolean): void
  (e: 'focus'): void
  (e: 'enter'): void
  (e: 'clear'): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search...',
  showDropdown: false,
})

const emit = defineEmits<Emits>()

const inputValue = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newValue) => {
    inputValue.value = newValue
  },
)

function handleInput(value: string) {
  emit('update:modelValue', value)
}

function handleClear() {
  emit('update:modelValue', '')
  emit('update:showDropdown', false)
  emit('clear')
}

function handleFocus() {
  if (inputValue.value) {
    emit('update:showDropdown', true)
  }
  emit('focus')
}

function handleEnter() {
  if (inputValue.value.trim()) {
    emit('enter')
  }
}

function handleClickOutside() {
  emit('update:showDropdown', false)
}
</script>

<template>
  <div v-click-outside="handleClickOutside" class="search-dropdown-container">
    <v-text-field
      :model-value="inputValue"
      :placeholder="placeholder"
      variant="outlined"
      density="comfortable"
      bg-color="white"
      rounded="lg"
      hide-details
      class="search-field"
      @update:model-value="handleInput"
      @focus="handleFocus"
      @keyup.enter="handleEnter"
    >
      <template v-slot:append-inner>
        <v-btn
          v-if="inputValue"
          icon="mdi-close"
          variant="text"
          size="small"
          @click="handleClear"
        />
      </template>
    </v-text-field>

    <!-- Dropdown slot -->
    <v-card v-if="showDropdown && inputValue" class="search-results mt-2" elevation="8">
      <slot name="dropdown" />
    </v-card>
  </div>
</template>

<style scoped>
.search-dropdown-container {
  position: relative;
}

.search-field {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-field :deep(.v-field) {
  font-size: 1rem;
}

.search-field :deep(.v-field__input) {
  padding: 1rem 1.25rem;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  max-height: 400px;
  overflow-y: auto;
  border-radius: 12px;
}
</style>
