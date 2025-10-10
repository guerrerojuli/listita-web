<script setup lang="ts">
import { formatValueWithUnit } from '@/utils/units'
import type { Product } from '@/types/api'

interface Props {
  product: Product
}

defineProps<Props>()
</script>

<template>
  <div class="product-categories">
    <v-chip size="small" class="category-chip" prepend-icon="mdi-tag-outline">
      {{ product.category?.name ?? 'Sin categoría' }}
    </v-chip>
    <v-chip
      v-if="formatValueWithUnit((product.metadata as any)?.unitValue, (product.metadata as any)?.unit)"
      size="small"
      class="unit-chip"
      prepend-icon="mdi-ruler"
    >
      {{ formatValueWithUnit((product.metadata as any)?.unitValue, (product.metadata as any)?.unit) }}
    </v-chip>
  </div>
  
</template>

<style scoped>
.product-categories {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.category-chip {
  background-color: #f5f5f5 !important;
  color: #424242 !important;
  font-weight: 500;
}

.unit-chip {
  background-color: #eeeeee !important;
  color: #424242 !important;
  font-weight: 500;
}
</style>


