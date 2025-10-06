<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue: string
  placeholder?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search...',
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
</script>

<template>
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
  />
</template>

<style scoped>
.search-field {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-field :deep(.v-field) {
  font-size: 1rem;
}

.search-field :deep(.v-field__input) {
  padding: 1rem 1.25rem;
}
</style>
