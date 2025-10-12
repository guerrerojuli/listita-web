<script setup lang="ts">
import type { Product } from '@/types/api'

interface Props {
  product: Product
}

defineProps<Props>()
</script>

<template>
  <div class="product-categories">
    <v-chip size="default" class="category-chip" prepend-icon="mdi-tag-outline">
      {{ product.category?.name ?? 'Sin categoría' }}
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
  padding: 0 20px !important;
  height: 32px !important;
}
</style>
