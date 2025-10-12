<script setup lang="ts">
interface Props {
  modelValue?: string | number | null
  label: string
  type?: string
  placeholder?: string
  autofocus?: boolean
  hint?: string
  persistentHint?: boolean
  disabled?: boolean
  autocomplete?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  autofocus: false,
  persistentHint: false,
  disabled: false,
  autocomplete: 'off',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  keyup: [event: KeyboardEvent]
}>()

function handleInput(value: string | number) {
  emit('update:modelValue', value)
}

function handleKeyup(event: KeyboardEvent) {
  emit('keyup', event)
}
</script>

<template>
  <v-text-field
    :model-value="props.modelValue"
    :label="props.label"
    :type="props.type"
    :placeholder="props.placeholder"
    :autofocus="props.autofocus"
    :hint="props.hint"
    :persistent-hint="props.persistentHint"
    :disabled="props.disabled"
    :autocomplete="props.autocomplete"
    variant="outlined"
    density="comfortable"
    @update:model-value="handleInput"
    @keyup="handleKeyup"
  />
</template>
