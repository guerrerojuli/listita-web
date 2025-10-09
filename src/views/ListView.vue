<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useListsStore } from '@/stores/lists'
import { useProductsStore } from '@/stores/products'
import ProductItem from '@/components/ProductItem.vue'

const route = useRoute()
const router = useRouter()
const listsStore = useListsStore()
const productsStore = useProductsStore()

const listId = computed(() => Number(route.params.id as string))
const list = computed(() => listsStore.lists.find((l) => l.id === listId.value))

// Update document title when list changes
watch(list, (newList) => {
  if (newList) {
    document.title = `Listita - ${newList.name}`
  }
}, { immediate: true })

const items = computed(() => productsStore.getItemsByListId(listId.value))

const searchQuery = ref('')
const newProductName = ref('')

const filteredProducts = computed(() => {
  if (!searchQuery.value) return items.value
  return items.value.filter((i) =>
    i.product.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

async function handleAddProduct() {
  // For simplicity, there's no API to create product by name directly.
  // In a full UI you'd search products first; here we no-op.
  alert('Use Products to create a product first, then add items via product selector (not implemented).')
}

function handleSearchOrAdd(value: string) {
  searchQuery.value = value
  newProductName.value = value
}

function handleToggleComplete(itemId: number) {
  productsStore.setPurchased(listId.value, itemId, !items.value.find((i) => i.id === itemId)?.purchased)
}

function handleIncrement(itemId: number) {
  productsStore.incrementQuantity(listId.value, itemId)
}

function handleDecrement(itemId: number) {
  productsStore.decrementQuantity(listId.value, itemId)
}

function handleDeleteProduct(productId: number) {
  if (confirm('Are you sure you want to delete this product?')) {
    productsStore.deleteItem(listId.value, productId)
  }
}

function handleEditProduct(_productId: number) {
  // Not implemented in API for items (only quantity/unit). Handled via quantity controls.
}

async function handleEditList() {
  if (list.value) {
    const newName = prompt('New list name:', list.value.name)
    if (newName && newName.trim()) {
      await listsStore.updateList(listId.value, { name: newName.trim() })
    }
  }
}

async function handlePurchaseList() {
  if (confirm('Mark this list as purchased? This will save it to history.')) {
    try {
      await listsStore.purchaseList(listId.value)
      alert('List purchased successfully!')
      router.push('/')
    } catch (err) {
      alert('Failed to purchase list')
    }
  }
}

async function handleResetList() {
  if (confirm('Reset all items to unpurchased?')) {
    try {
      await listsStore.resetListItems(listId.value)
      await productsStore.loadListItems(listId.value)
    } catch (err) {
      alert('Failed to reset list')
    }
  }
}

function handleShareList() {
  const email = prompt('Enter email address to share with:')
  if (email && email.trim()) {
    listsStore
      .shareList(listId.value, email.trim())
      .then(() => alert('List shared successfully!'))
      .catch(() => alert('Failed to share list'))
  }
}

if (!list.value) {
  router.push('/')
}

onMounted(() => {
  if (list.value) productsStore.loadListItems(listId.value).catch(() => {})
})
</script>

<template>
  <div v-if="list" class="list-view">
    <v-container class="py-8">
      <div class="d-flex align-center justify-space-between mb-8">
        <h1 class="page-title">{{ list.name }}</h1>
        <div class="header-actions">
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props" />
            </template>
            <v-list>
              <v-list-item @click="handleEditList">
                <template v-slot:prepend>
                  <v-icon icon="mdi-pencil-outline" />
                </template>
                <v-list-item-title>Rename</v-list-item-title>
              </v-list-item>
              <v-list-item @click="handleShareList">
                <template v-slot:prepend>
                  <v-icon icon="mdi-share-variant-outline" />
                </template>
                <v-list-item-title>Share</v-list-item-title>
              </v-list-item>
              <v-divider />
              <v-list-item @click="handleResetList">
                <template v-slot:prepend>
                  <v-icon icon="mdi-refresh" />
                </template>
                <v-list-item-title>Reset Items</v-list-item-title>
              </v-list-item>
              <v-list-item @click="handlePurchaseList">
                <template v-slot:prepend>
                  <v-icon icon="mdi-cart-check" />
                </template>
                <v-list-item-title>Mark as Purchased</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>

      <div class="mb-10" style="max-width: 900px; margin-left: auto; margin-right: auto">
        <v-text-field
          :model-value="searchQuery"
          placeholder="Search or add a product..."
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
            v-for="item in filteredProducts"
            :key="item.id"
            :item="item"
            @toggle-complete="handleToggleComplete(item.id)"
            @increment="handleIncrement(item.id)"
            @decrement="handleDecrement(item.id)"
            @delete="handleDeleteProduct(item.id)"
            @edit="handleEditProduct(item.id)"
          />
        </div>
      </div>

      <div v-else-if="searchQuery" class="empty-state">
        <p class="text-body-1 text-medium-emphasis mb-4">"{{ searchQuery }}" not found</p>
        <v-btn color="black" elevation="0" @click="handleAddProduct">
          Add "{{ searchQuery }}" to the list
        </v-btn>
      </div>

      <div v-else class="empty-state">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-cart-outline</v-icon>
        <p class="text-h6 text-medium-emphasis">No products in this list</p>
        <p class="text-body-2 text-medium-emphasis">Use the search bar above to add products</p>
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
