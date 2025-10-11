<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import SearchDropdown from '@/components/SearchDropdown.vue'
import BaseDialog from '@/components/BaseDialog.vue'
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
watch(
  list,
  (newList) => {
    if (newList) {
      document.title = `Listita - ${newList.name}`
    }
  },
  { immediate: true },
)

const items = computed(() => productsStore.getItemsByListId(listId.value))

const searchQuery = ref('')
const isLoading = ref(false)
const isSearching = ref(false)

const showDeleteDialog = ref(false)
const deleteItemId = ref<number | null>(null)
const deleteProductName = ref('')

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
  const itemProductIds = new Set((items.value || []).map((i) => i.product?.id).filter(Boolean))
  return (globalProductsStore.products || []).filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.value.toLowerCase())
    const notInList = !itemProductIds.has(p.id)
    return matchesSearch && notInList
  })
})

async function handleSearchEnter() {
  if (!searchQuery.value.trim()) return

  // Search for products
  isSearching.value = true
  try {
    await globalProductsStore.fetchProducts({ name: searchQuery.value.trim() })
  } catch (err) {
    console.error('Failed to search products:', err)
  } finally {
    isSearching.value = false
  }

  // If there's a matching product, add the first one
  if (availableProducts.value.length > 0) {
    const product = availableProducts.value[0]
    if (product) {
      await handleAddProduct(product)
    }
  } else {
    // No products found, clear search and navigate to create one
    searchQuery.value = ''
    router.push('/products')
  }
}

async function handleAddProduct(product: Product) {
  try {
    // Check if product is already in the list
    const isAlreadyInList = items.value?.some((item) => item.product?.id === product.id)

    if (isAlreadyInList) {
      alert(`"${product.name}" is already in this list`)
      searchQuery.value = ''
      return
    }

    const defaultUnit = (product.metadata as any)?.unit || 'unit'
    await productsStore.addItem(listId.value, product.id, 1, defaultUnit)
    searchQuery.value = ''
  } catch (err: any) {
    console.error('Failed to add product:', err)
    const errorMessage = err.message || 'Failed to add product to list'
    alert(`Failed to add product: ${errorMessage}`)
  }
}

function handleToggleComplete(itemId: number) {
  productsStore.setPurchased(
    listId.value,
    itemId,
    !items.value.find((i) => i.id === itemId)?.purchased,
  )
}

function handleIncrement(itemId: number) {
  productsStore.incrementQuantity(listId.value, itemId)
}

function handleDecrement(itemId: number) {
  productsStore.decrementQuantity(listId.value, itemId)
}

function handleDeleteProduct(itemId: number) {
  const item = items.value?.find((i) => i.id === itemId)
  if (item) {
    deleteItemId.value = itemId
    deleteProductName.value = item.product?.name || 'this item'
    showDeleteDialog.value = true
  }
}

async function confirmDeleteProduct() {
  if (deleteItemId.value) {
    await productsStore.deleteItem(listId.value, deleteItemId.value)
    showDeleteDialog.value = false
    deleteItemId.value = null
    deleteProductName.value = ''
  }
}

function handleEditProduct() {
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
    } catch {
      alert('Failed to purchase list')
    }
  }
}

async function handleResetList() {
  if (confirm('Reset all items to unpurchased?')) {
    try {
      await listsStore.resetListItems(listId.value)
      await productsStore.loadListItems(listId.value)
    } catch {
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
  <NavBar />
  <div v-if="isLoading" class="list-view">
    <v-container class="py-8">
      <div class="d-flex justify-center align-center" style="min-height: 50vh">
        <v-progress-circular indeterminate size="64" color="primary" />
      </div>
    </v-container>
  </div>
  <div v-else-if="list" class="list-view">
    <v-container class="py-8">
      <div
        class="d-flex align-center justify-space-between mb-8"
        style="max-width: 900px; margin-left: auto; margin-right: auto"
      >
        <div class="d-flex align-center gap-3">
          <v-btn
            icon="mdi-arrow-left"
            variant="text"
            size="large"
            class="back-button"
            @click="router.push('/')"
          />
          <h1 class="page-title">{{ list.name }}</h1>
        </div>
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
        <SearchDropdown
          v-model="searchQuery"
          placeholder="Search or add a product..."
          :show-dropdown="false"
          @enter="handleSearchEnter"
        />
        <v-fade-transition>
          <div v-if="searchQuery.trim() && !isSearching" class="search-hint mt-2">
            <v-icon size="small" class="mr-1">mdi-keyboard-return</v-icon>
            <span v-if="availableProducts.length > 0 && availableProducts[0]">
              Press Enter to add "{{ availableProducts[0].name }}"
            </span>
            <span v-else> Press Enter to create "{{ searchQuery }}" </span>
          </div>
        </v-fade-transition>
      </div>

      <div
        v-if="filteredListItems && filteredListItems.length > 0"
        class="mb-10"
        style="max-width: 900px; margin-left: auto; margin-right: auto"
      >
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
            @edit="handleEditProduct()"
          />
        </div>
      </div>

      <div
        v-else-if="!searchQuery || (filteredListItems && filteredListItems.length === 0)"
        class="empty-state"
      >
        <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-cart-outline</v-icon>
        <p class="text-h6 text-medium-emphasis">No products in this list</p>
        <p class="text-body-2 text-medium-emphasis">Use the search bar above to add products</p>
      </div>

      <!-- Dialog for deleting product from list -->
      <BaseDialog v-model="showDeleteDialog" title="Remove Product" :max-width="450">
        <div class="delete-confirmation">
          <v-icon icon="mdi-alert-circle-outline" size="48" color="error" class="mb-4" />
          <p class="delete-message">
            Are you sure you want to remove <strong>{{ deleteProductName }}</strong> from this list?
          </p>
          <p class="delete-warning">This action cannot be undone.</p>
        </div>

        <template #actions="{ close }">
          <v-btn class="btn-cancel" elevation="0" @click="close">Cancel</v-btn>
          <v-btn class="btn-remove" elevation="0" @click="confirmDeleteProduct">Remove</v-btn>
        </template>
      </BaseDialog>
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

.back-button:hover {
  background-color: transparent !important;
}

.search-hint {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #666;
  padding: 0.5rem 0.75rem;
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

/* Delete confirmation styles */
.delete-confirmation {
  text-align: center;
  padding: 1rem 0;
}

.delete-message {
  font-size: 1rem;
  color: #212121;
  margin-bottom: 0.5rem;
}

.delete-message strong {
  color: #000;
  font-weight: 600;
}

.delete-warning {
  font-size: 0.875rem;
  color: #e53935;
  margin: 0;
}

.btn-remove {
  color: white !important;
  background-color: #e53935 !important;
  text-transform: none;
  font-weight: 500;
  padding: 0 24px !important;
  border-radius: 8px !important;
}

.btn-remove:hover {
  background-color: #c62828 !important;
}

.btn-cancel {
  text-transform: none;
  font-weight: 500;
  color: #666 !important;
}
</style>
