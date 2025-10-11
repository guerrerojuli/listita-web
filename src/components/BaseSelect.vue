<script setup lang="ts">
interface Props {
  modelValue?: string | number | null
  label: string
  items: unknown[]
  itemTitle?: string
  itemValue?: string
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  itemTitle: 'title',
  itemValue: 'value',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
}>()

function handleInput(value: string | number | null) {
  emit('update:modelValue', value)
}
</script>

<template>
  <v-select
    :model-value="props.modelValue"
    :label="props.label"
    :items="props.items"
    :item-title="props.itemTitle"
    :item-value="props.itemValue"
    :placeholder="props.placeholder"
    :disabled="props.disabled"
    variant="outlined"
    density="comfortable"
    @update:model-value="handleInput"
  />
</template>
