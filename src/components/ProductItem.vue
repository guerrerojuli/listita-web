<script setup lang="ts">
import { ref } from 'vue'
import type { Product } from '@/types/product'

interface Props {
  product: Product
}

interface Emits {
  (e: 'toggle-complete'): void
  (e: 'increment'): void
  (e: 'decrement'): void
  (e: 'delete'): void
  (e: 'edit'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const showMenu = ref(false)
</script>

<template>
  <div class="product-item" :class="{ 'product-completed': product.completed }">
    <div class="product-checkbox">
      <v-checkbox
        :model-value="product.completed"
        hide-details
        density="compact"
        @update:model-value="emit('toggle-complete')"
      />
    </div>

    <div class="product-info">
      <span class="product-name">{{ product.name }}</span>
    </div>

    <div class="product-actions">
      <v-btn
        icon="mdi-minus"
        variant="text"
        size="small"
        :disabled="product.quantity <= 1"
        @click="emit('decrement')"
      />
      <span class="product-quantity">{{ product.quantity }}</span>
      <v-btn icon="mdi-plus" variant="text" size="small" @click="emit('increment')" />

      <v-menu v-model="showMenu" :close-on-content-click="false" location="bottom end">
        <template v-slot:activator="{ props: menuProps }">
          <v-btn icon="mdi-dots-vertical" variant="text" size="small" v-bind="menuProps" />
        </template>

        <v-card min-width="200" class="menu-card" elevation="0">
          <v-list class="menu-list">
            <v-list-item @click="emit('edit')" class="menu-item" rounded="lg">
              <template v-slot:prepend>
                <v-icon icon="mdi-pencil-outline" size="20" class="menu-icon" />
              </template>
              <v-list-item-title class="menu-text">Editar</v-list-item-title>
            </v-list-item>

            <v-list-item
              @click="
                () => {
                  emit('delete')
                  showMenu = false
                }
              "
              class="menu-item menu-item-danger"
              rounded="lg"
            >
              <template v-slot:prepend>
                <v-icon icon="mdi-delete-outline" size="20" class="menu-icon" />
              </template>
              <v-list-item-title class="menu-text">Eliminar</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
    </div>
  </div>
</template>

<style scoped>
.product-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.product-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.product-completed {
  opacity: 0.6;
}

.product-checkbox {
  flex-shrink: 0;
}

.product-checkbox :deep(.v-checkbox) {
  margin: 0;
  padding: 0;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 1rem;
  font-weight: 500;
  color: #212121;
}

.product-completed .product-name {
  text-decoration: line-through;
  color: #9e9e9e;
}

.product-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.product-quantity {
  font-size: 1rem;
  font-weight: 500;
  color: #212121;
  min-width: 2rem;
  text-align: center;
}

.menu-card {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
}

.menu-list {
  padding: 0.5rem;
  background: white;
}

.menu-item {
  cursor: pointer;
  min-height: 44px;
  margin-bottom: 2px;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background-color: #f5f5f5 !important;
}

.menu-icon {
  color: #424242;
  margin-right: 12px;
}

.menu-text {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #212121;
}

.menu-item-danger:hover {
  background-color: #ffebee !important;
}

.menu-item-danger .menu-icon {
  color: #f44336;
}

.menu-item-danger .menu-text {
  color: #f44336;
}
</style>
