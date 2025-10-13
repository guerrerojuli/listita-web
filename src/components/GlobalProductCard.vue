<script setup lang="ts">
import ProductMetaChips from '@/components/ProductMetaChips.vue'
import type { Product } from '@/types/api'

interface Props {
  product: Product
}

interface Emits {
  (e: 'edit'): void
  (e: 'delete'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
</script>

<template>
  <div class="product-card">
    <div class="product-main-info">
      <h3 class="product-name">{{ product.name }}</h3>
    </div>

    <div class="product-right">
      <ProductMetaChips :product="product" />

      <div class="product-actions">
        <v-btn icon="mdi-pencil-outline" variant="text" size="small" @click.stop="emit('edit')" />
        <v-btn
          icon="mdi-delete-outline"
          variant="text"
          size="small"
          color="error"
          @click.stop="emit('delete')"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1.5rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.product-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.product-main-info {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex: 1;
  min-width: 200px;
}

.product-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #000;
  margin: 0;
}

.product-price {
  font-size: 1.125rem;
  font-weight: 500;
  color: #424242;
}

.product-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: auto;
}

.product-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}
</style>
