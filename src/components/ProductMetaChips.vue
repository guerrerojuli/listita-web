<script setup lang="ts">
import { computed } from 'vue'
import { formatValueWithUnit } from '@/utils/units'
import type { Product } from '@/types/api'

interface Props {
  product: Product
  chipSize?: 'small' | 'default'
  unitOverride?: string | null
  unitValueOverride?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  chipSize: 'small',
})

const effectiveUnit = computed<string | null>(() => {
  const fromOverride = props.unitOverride ?? null
  if (fromOverride !== null && fromOverride !== undefined) return fromOverride
  return ((props.product.metadata as any) || {}).unit ?? null
})

const effectiveUnitValue = computed<number | null>(() => {
  const fromOverride =
    props.unitValueOverride !== undefined && props.unitValueOverride !== null
      ? Number(props.unitValueOverride)
      : null
  if (fromOverride !== null && !Number.isNaN(fromOverride)) return fromOverride
  const metaVal = ((props.product.metadata as any) || {}).unitValue
  return typeof metaVal === 'number' && !Number.isNaN(metaVal) ? Number(metaVal) : null
})

const unitChipText = computed<string | null>(() =>
  formatValueWithUnit(effectiveUnitValue.value, effectiveUnit.value),
)
</script>

<template>
  <div class="product-categories">
    <v-chip :size="props.chipSize" class="category-chip" prepend-icon="mdi-tag-outline">
      {{ product.category?.name ?? 'Sin categoría' }}
    </v-chip>
    <v-chip v-if="unitChipText" :size="props.chipSize" class="unit-chip" prepend-icon="mdi-ruler">
      {{ unitChipText }}
    </v-chip>
  </div>
  
</template>

<style scoped>
.product-categories {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.category-chip {
  background-color: #f5f5f5 !important;
  color: #424242 !important;
  font-weight: 500;
  padding: 0 16px !important;
}

.unit-chip {
  background-color: #eeeeee !important;
  color: #424242 !important;
  font-weight: 500;
  padding: 0 16px !important;
}
</style>


