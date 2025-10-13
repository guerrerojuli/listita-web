<script setup lang="ts">
interface Props {
  modelValue?: string | null
  label: string
  placeholder?: string
  hint?: string
  persistentHint?: boolean
  disabled?: boolean
  maxlength?: number
  counter?: boolean
  rows?: number
  maxRows?: number
}

const props = withDefaults(defineProps<Props>(), {
  persistentHint: false,
  disabled: false,
  counter: false,
  rows: 3,
  maxRows: 8,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function handleInput(value: string) {
  emit('update:modelValue', value)
}
</script>

<template>
  <v-textarea
    :model-value="props.modelValue"
    :label="props.label"
    :placeholder="props.placeholder"
    :hint="props.hint"
    :persistent-hint="props.persistentHint"
    :disabled="props.disabled"
    :maxlength="props.maxlength"
    :counter="props.counter ? props.maxlength : undefined"
    :rows="props.rows"
    :max-rows="props.maxRows"
    auto-grow
    variant="outlined"
    density="comfortable"
    @update:model-value="handleInput"
  />
</template>
