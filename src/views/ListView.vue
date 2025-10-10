<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useListsStore } from '@/stores/lists'
import { useProductsStore } from '@/stores/products'
import { useGlobalProductsStore } from '@/stores/globalProducts'
import ProductItem from '@/components/ProductItem.vue'
import type { Product } from '@/types/api'

const route = useRoute()
const router = useRouter()
const listsStore = useListsStore()
const productsStore = useProductsStore()
const globalProductsStore = useGlobalProductsStore()

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
const showSearchResults = ref(false)
const isSearching = ref(false)
const isLoading = ref(false)

// Filter list items based on search query
const filteredListItems = computed(() => {
  if (!searchQuery.value) return items.value || []
  return (items.value || []).filter((i) =>
    i.product?.name?.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

// Get available products to add (excluding ones already in list)
const availableProducts = computed(() => {
  if (!searchQuery.value) return []
  const itemProductIds = new Set((items.value || []).map(i => i.product?.id).filter(Boolean))
  return (globalProductsStore.products || []).filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.value.toLowerCase())
    const notInList = !itemProductIds.has(p.id)
    return matchesSearch && notInList
  })
})

async function handleSearchInput(value: string) {
  searchQuery.value = value
  
  if (value.trim().length > 0) {
    showSearchResults.value = true
    isSearching.value = true
    try {
      await globalProductsStore.fetchProducts({ name: value.trim() })
    } catch (err) {
      console.error('Failed to search products:', err)
    } finally {
      isSearching.value = false
    }
  } else {
    showSearchResults.value = false
  }
}

async function handleAddProduct(product: Product) {
  try {
    await productsStore.addItem(listId.value, product.id, 1, 'unit')
    searchQuery.value = ''
    showSearchResults.value = false
  } catch (err: any) {
    console.error('Failed to add product:', err)
    const errorMessage = err.message || 'Failed to add product to list'
    alert(`Failed to add product: ${errorMessage}`)
  }
}

function handleCloseSearch() {
  showSearchResults.value = false
  searchQuery.value = ''
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

onMounted(async () => {
  isLoading.value = true
  
  // If list is not in store, try to fetch it from API
  if (!list.value) {
    try {
      const fetchedList = await listsStore.getListById(listId.value)
      // Add to store if not already there
      if (fetchedList && !listsStore.lists.find((l) => l.id === fetchedList.id)) {
        listsStore.lists.push(fetchedList)
      }
    } catch (err) {
      console.error('Failed to load list:', err)
      // Only redirect if list doesn't exist
      router.push('/')
      return
    }
  }
  
  // Load list items
  try {
    await productsStore.loadListItems(listId.value)
  } catch (err) {
    console.error('Failed to load list items:', err)
  }
  
  // Pre-load products for search
  try {
    await globalProductsStore.fetchProducts()
  } catch (err) {
    console.error('Failed to load products:', err)
  }
  
  isLoading.value = false
})
</script>

<template>
  <div v-if="isLoading" class="list-view">
    <v-container class="py-8">
      <div class="d-flex justify-center align-center" style="min-height: 50vh;">
        <v-progress-circular indeterminate size="64" color="primary" />
      </div>
    </v-container>
  </div>
  <div v-else-if="list" class="list-view">
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

      <div
        v-click-outside="() => { showSearchResults = false }"
        class="mb-10 search-container"
        style="max-width: 900px; margin-left: auto; margin-right: auto"
      >
        <v-text-field
          v-model="searchQuery"
          placeholder="Search or add a product..."
          variant="outlined"
          density="comfortable"
          bg-color="white"
          rounded="lg"
          hide-details
          class="search-field"
          @update:model-value="handleSearchInput"
          @focus="searchQuery && (showSearchResults = true)"
        >
          <template v-slot:append-inner>
            <v-btn
              v-if="searchQuery"
              icon="mdi-close"
              variant="text"
              size="small"
              @click="handleCloseSearch"
            />
          </template>
        </v-text-field>

        <!-- Search results dropdown -->
        <v-card
          v-if="showSearchResults && searchQuery"
          class="search-results mt-2"
          elevation="8"
        >
          <v-list v-if="availableProducts && availableProducts.length > 0" density="compact">
            <v-list-subheader>Products you can add</v-list-subheader>
            <v-list-item
              v-for="product in availableProducts"
              :key="product.id"
              @click="handleAddProduct(product)"
              class="search-result-item"
            >
              <template v-slot:prepend>
                <v-icon icon="mdi-plus-circle-outline" color="success" />
              </template>
              <v-list-item-title>{{ product.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ product.category?.name ?? 'Sin categoría' }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
          
          <div v-else-if="isSearching" class="pa-4 text-center">
            <v-progress-circular indeterminate size="24" />
            <p class="text-caption mt-2">Searching...</p>
          </div>
          
          <div v-else class="pa-4 text-center">
            <p class="text-body-2 text-medium-emphasis mb-3">No products found for "{{ searchQuery }}"</p>
            <v-btn
              color="primary"
              variant="text"
              size="small"
              @click="router.push('/products')"
            >
              Create new product
            </v-btn>
          </div>
        </v-card>
      </div>

      <div v-if="filteredListItems && filteredListItems.length > 0" class="mb-10">
        <h2 class="section-title mb-6">Shopping List</h2>
        <div class="products-grid">
          <ProductItem
            v-for="item in filteredListItems"
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

      <div v-else-if="!searchQuery || (filteredListItems && filteredListItems.length === 0)" class="empty-state">
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

.search-container {
  position: relative;
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

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  max-height: 400px;
  overflow-y: auto;
  border-radius: 12px;
}

.search-result-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-result-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
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
