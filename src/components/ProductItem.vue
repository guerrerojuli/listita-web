<script setup lang="ts">
import { ref, watch } from 'vue'
import { toUnitAbbreviation, formatProductName } from '@/utils/units'
import ProductMetaChips from '@/components/ProductMetaChips.vue'
import type { ListItem } from '@/types/api'

interface Props {
  item: ListItem
}

interface Emits {
  (e: 'toggle-complete'): void
  (e: 'increment'): void
  (e: 'decrement'): void
  (e: 'update-quantity', quantity: number): void
  (e: 'delete'): void
  (e: 'edit'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const showMenu = ref(false)
const editableQuantity = ref(0)

function shortUnit(unit?: string) {
  return unit ? (toUnitAbbreviation(unit) ?? unit) : ''
}

function displayQuantity(q?: number) {
  if (typeof q !== 'number' || Number.isNaN(q)) return 0
  return Math.trunc(q)
}

function updateQuantity() {
  const newQty = Number(editableQuantity.value)
  if (!Number.isNaN(newQty) && newQty >= 0) {
    // Round to 2 decimal places max
    const roundedQty = Math.round(newQty * 100) / 100
    editableQuantity.value = roundedQty
    emit('update-quantity', roundedQty)
  } else {
    editableQuantity.value = props.item.quantity
  }
}

function formatQuantity(qty: number): number {
  return Math.round(qty * 100) / 100
}

function handleInputChange() {
  // Format the input in real-time to prevent excessive decimals
  const formatted = formatQuantity(Number(editableQuantity.value))
  if (formatted !== editableQuantity.value) {
    editableQuantity.value = formatted
  }
}

function handleIncrement() {
  const newQty = formatQuantity(Number(editableQuantity.value) + 1)
  editableQuantity.value = newQty
  emit('update-quantity', newQty)
}

function handleDecrement() {
  const newQty = formatQuantity(Math.max(0, Number(editableQuantity.value) - 1))
  editableQuantity.value = newQty
  emit('update-quantity', newQty)
}

// Initialize editable quantity when component mounts or item changes
watch(() => props.item.quantity, (newQty) => {
  editableQuantity.value = formatQuantity(newQty)
}, { immediate: true })
</script>

<template>
  <div class="product-item" :class="{ 'product-completed': item.purchased }">
    <div class="product-checkbox">
      <v-checkbox
        :model-value="item.purchased"
        hide-details
        density="compact"
        @update:model-value="emit('toggle-complete')"
      />
    </div>

    <div class="product-info">
      <span class="product-name">
        {{ item.product ? item.product.name : 'Producto' }}
      </span>
    </div>

    <div class="product-right">
        <div class="product-tags" v-if="item.product">
          <ProductMetaChips
            :product="item.product"
            chip-size="default"
            :unit-override="null"
            :unit-value-override="null"
          />
        </div>

      <div class="product-actions">
        <v-btn
          icon="mdi-minus"
          variant="text"
          size="small"
          :disabled="item.purchased || editableQuantity <= 1"
          @click="!item.purchased && handleDecrement()"
        />
        <v-text-field
          v-model.number="editableQuantity"
          type="number"
          step="0.01"
          min="0"
          density="compact"
          variant="outlined"
          hide-details
          :disabled="item.purchased"
          :suffix="shortUnit(item.unit)"
          class="quantity-input"
          @blur="updateQuantity"
          @keyup.enter="updateQuantity"
          @input="handleInputChange"
        />
        <v-btn
          icon="mdi-plus"
          variant="text"
          size="small"
          :disabled="item.purchased"
          @click="!item.purchased && handleIncrement()"
        />

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
                <v-list-item-title class="menu-text">Edit</v-list-item-title>
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
                <v-list-item-title class="menu-text">Delete</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </div>
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
  position: relative;
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

.product-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: auto;
}

.product-tags {
  display: flex;
  gap: 0.75rem;
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

.quantity-input {
  width: 120px;
}

.quantity-input :deep(.v-field__input) {
  text-align: center;
  font-weight: 500;
}

/* Hide number input arrows */
.quantity-input :deep(input[type='number']::-webkit-outer-spin-button),
.quantity-input :deep(input[type='number']::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}

.quantity-input :deep(input[type='number']) {
  -moz-appearance: textfield;
  appearance: textfield;
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
