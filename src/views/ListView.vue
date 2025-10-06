<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useListsStore } from '@/stores/lists'
import { useProductsStore } from '@/stores/products'
import ProductItem from '@/components/ProductItem.vue'

const route = useRoute()
const router = useRouter()
const listsStore = useListsStore()
const productsStore = useProductsStore()

const listId = computed(() => route.params.id as string)
const list = computed(() => listsStore.lists.find((l) => l.id === listId.value))

const products = computed(() => productsStore.getProductsByListId(listId.value))

const searchQuery = ref('')
const newProductName = ref('')

const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value
  return products.value.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

function handleAddProduct() {
  if (newProductName.value.trim()) {
    productsStore.addProduct(listId.value, newProductName.value.trim())
    newProductName.value = ''
  }
}

function handleSearchOrAdd(value: string) {
  searchQuery.value = value
  newProductName.value = value
}

function handleToggleComplete(productId: string) {
  productsStore.toggleComplete(productId)
}

function handleIncrement(productId: string) {
  productsStore.incrementQuantity(productId)
}

function handleDecrement(productId: string) {
  productsStore.decrementQuantity(productId)
}

function handleDeleteProduct(productId: string) {
  if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
    productsStore.deleteProduct(productId)
  }
}

function handleEditProduct(productId: string) {
  const product = products.value.find((p) => p.id === productId)
  if (product) {
    const newName = prompt('Nuevo nombre del producto:', product.name)
    if (newName && newName.trim()) {
      // TODO: Implement edit functionality in store
      console.log('Edit product:', productId, 'to', newName)
    }
  }
}

function handleEditList() {
  if (list.value) {
    const newName = prompt('Nuevo nombre de la lista:', list.value.name)
    if (newName && newName.trim()) {
      console.log('Edit list:', listId.value, 'to', newName)
    }
  }
}

function handleShareList() {
  console.log('Share list:', listId.value)
}

if (!list.value) {
  router.push('/')
}
</script>

<template>
  <div v-if="list" class="list-view">
    <v-container class="py-8">
      <div class="d-flex align-center justify-space-between mb-8">
        <h1 class="page-title">{{ list.name }}</h1>
        <div class="header-actions">
          <v-btn icon="mdi-pencil-outline" variant="text" @click="handleEditList" />
          <v-btn icon="mdi-share-variant-outline" variant="text" @click="handleShareList" />
        </div>
      </div>

      <div class="mb-10" style="max-width: 900px; margin-left: auto; margin-right: auto">
        <v-text-field
          :model-value="searchQuery"
          placeholder="Buscar o agregar un producto..."
          variant="outlined"
          density="comfortable"
          bg-color="white"
          rounded="lg"
          hide-details
          class="search-field"
          @update:model-value="handleSearchOrAdd"
          @keyup.enter="handleAddProduct"
        />
      </div>

      <div v-if="filteredProducts.length > 0" class="mb-10">
        <h2 class="section-title mb-6">Shopping List</h2>
        <div class="products-grid">
          <ProductItem
            v-for="product in filteredProducts"
            :key="product.id"
            :product="product"
            @toggle-complete="handleToggleComplete(product.id)"
            @increment="handleIncrement(product.id)"
            @decrement="handleDecrement(product.id)"
            @delete="handleDeleteProduct(product.id)"
            @edit="handleEditProduct(product.id)"
          />
        </div>
      </div>

      <div v-else-if="searchQuery" class="empty-state">
        <p class="text-body-1 text-medium-emphasis mb-4">No se encontró "{{ searchQuery }}"</p>
        <v-btn color="black" elevation="0" @click="handleAddProduct">
          Agregar "{{ searchQuery }}" a la lista
        </v-btn>
      </div>

      <div v-else class="empty-state">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-cart-outline</v-icon>
        <p class="text-h6 text-medium-emphasis">No hay productos en esta lista</p>
        <p class="text-body-2 text-medium-emphasis">
          Usa el buscador arriba para agregar productos
        </p>
      </div>
    </v-container>
  </div>
</template>

<style scoped>
.list-view {
  background-color: #fafafa;
  min-height: calc(100vh - 72px);
}

.page-title {
  font-size: 3.5rem;
  font-weight: 700;
  color: #000;
  letter-spacing: -0.5px;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.search-field {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-field :deep(.v-field) {
  font-size: 1rem;
}

.search-field :deep(.v-field__input) {
  padding: 1rem 1.25rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #000;
}

.products-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}
</style>
