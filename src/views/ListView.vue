<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import NavBar from '@/components/NavBar.vue'
import SearchDropdown from '@/components/SearchDropdown.vue'
import BaseDialog from '@/components/BaseDialog.vue'
import BaseInput from '@/components/BaseInput.vue'
import BaseSelect from '@/components/BaseSelect.vue'
import BaseNotification from '@/components/BaseNotification.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import ListFormDialog from '@/components/ListFormDialog.vue'
import DialogButton from '@/components/DialogButton.vue'
import BaseButton from '@/components/BaseButton.vue'
import { useNotification } from '@/composables/useNotification'
import { useListsStore } from '@/stores/lists'
import { useProductsStore } from '@/stores/products'
import { useGlobalProductsStore } from '@/stores/globalProducts'
import { useAuthStore } from '@/stores/auth'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import ProductItem from '@/components/ProductItem.vue'
import type { Product } from '@/types/api'

const route = useRoute()
const router = useRouter()
const listsStore = useListsStore()
const productsStore = useProductsStore()
const globalProductsStore = useGlobalProductsStore()
const authStore = useAuthStore()
const { showSuccess, showError } = useNotification()

const { hasMore, loadingMore } = storeToRefs(productsStore)

const listId = computed(() => Number(route.params.id as string))
const list = computed(() => listsStore.lists.find((l) => l.id === listId.value))

const isOwner = computed(() => {
  if (!list.value || !authStore.user) return false
  return list.value.owner?.id === authStore.user.id
})

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
const loadMoreTrigger = ref<HTMLElement | null>(null)

const showDeleteDialog = ref(false)
const deleteItemId = ref<number | null>(null)
const deleteProductName = ref('')

const showEditItemDialog = ref(false)
const editingItem = ref<{
  id: number
  product?: { name?: string; category?: { name?: string } }
  unit?: string
  quantity?: number
} | null>(null)
const editItemUnit = ref<string>('unit')
const editItemAmount = ref<number>(1)

const showEditListDialog = ref(false)
const editListName = ref('')
const editListDescription = ref('')
const editListRecurring = ref(false)

const showAddProductDialog = ref(false)
const productSearchQuery = ref('')
const showCreateProductInDialog = ref(false)
const newProductName = ref('')
const newProductCategoryId = ref<number | null>(null)
const showInlineCategoryCreate = ref(false)
const inlineCategoryName = ref('')
const inlineCategoryError = ref('')
const dialogLoadMoreTrigger = ref<HTMLElement | null>(null)

const showEditCategoryDialog = ref(false)
const editingCategoryId = ref<number | null>(null)
const editCategoryName = ref('')
const showDeleteCategoryDialog = ref(false)
const deleteCategoryId = ref<number | null>(null)
const deleteCategoryName = ref('')

const showUnitQuantityDialog = ref(false)
const selectedProductToAdd = ref<Product | null>(null)
const addQuantity = ref(1)
const addUnit = ref<string>('unit')

const showPurchaseDialog = ref(false)
const showResetDialog = ref(false)
const showShareDialog = ref(false)
const shareEmail = ref('')
const shareError = ref('')
const shareLoading = ref(false)

const unitOptions = [
  { title: 'No unit', value: 'none' },
  { title: 'Unit', value: 'unit' },
  { title: 'Liters', value: 'liters' },
  { title: 'Milliliters', value: 'milliliters' },
  { title: 'Kilograms', value: 'kilograms' },
  { title: 'Grams', value: 'grams' },
  { title: 'Volume', value: 'volume' },
  { title: 'Pack', value: 'pack' },
  { title: 'Pounds', value: 'pounds' },
  { title: 'Ounces', value: 'ounces' },
  { title: 'Centimeters', value: 'centimeters' },
  { title: 'Meters', value: 'meters' },
]

const filteredListItems = computed(() => {
  if (!searchQuery.value) return items.value || []
  return (items.value || []).filter((i) =>
    i.product?.name?.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

const filteredDialogProducts = computed(() => {
  const itemProductIds = new Set((items.value || []).map((i) => i.product?.id).filter(Boolean))
  const allAvailableProducts = (globalProductsStore.products || []).filter(
    (p) => !itemProductIds.has(p.id),
  )

  if (!productSearchQuery.value) return allAvailableProducts

  return allAvailableProducts.filter((p) =>
    p.name?.toLowerCase().includes(productSearchQuery.value.toLowerCase()),
  )
})

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

function handleUpdateQuantity(itemId: number, quantity: number) {
  productsStore.updateQuantity(listId.value, itemId, quantity)
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

function handleEditProduct(itemId: number) {
  const item = items.value?.find((i) => i.id === itemId)
  if (item) {
    editingItem.value = item
    editItemUnit.value = item.unit || 'unit'
    editItemAmount.value = item.quantity || 1
    showEditItemDialog.value = true
  }
}

async function confirmEditItem() {
  if (editingItem.value) {
    try {
      await productsStore.updateQuantity(
        listId.value,
        editingItem.value.id,
        editItemAmount.value,
        editItemUnit.value,
      )
      showEditItemDialog.value = false
      editingItem.value = null
    } catch (err: unknown) {
      console.error('Failed to update item:', err)
      showError('Failed to update item')
    }
  }
}

function handleEditList() {
  if (list.value) {
    editListName.value = list.value.name
    editListDescription.value = list.value.description || ''
    editListRecurring.value = list.value.recurring || false
    showEditListDialog.value = true
  }
}

async function confirmEditList() {
  if (editListName.value.trim()) {
    try {
      await listsStore.updateList(listId.value, {
        name: editListName.value.trim(),
        description: editListDescription.value?.trim() || '',
        recurring: editListRecurring.value,
      })
      showEditListDialog.value = false
      editListName.value = ''
      editListDescription.value = ''
      editListRecurring.value = false
    } catch (err: unknown) {
      console.error('Failed to update list:', err)
      showError('Failed to update list')
    }
  }
}

function handlePurchaseList() {
  showPurchaseDialog.value = true
}

async function confirmPurchase() {
  try {
    await listsStore.purchaseList(listId.value)
    showSuccess('List purchased successfully!')
    router.push('/')
  } catch (err: unknown) {
    showError((err as Error)?.message || 'Failed to purchase list')
  }
}

function handleResetList() {
  showResetDialog.value = true
}

async function confirmReset() {
  try {
    await listsStore.resetListItems(listId.value)
    await productsStore.loadListItems(listId.value)
    showSuccess('List items reset successfully!')
  } catch {
    showError('Failed to reset list')
  }
}

async function handleToggleRecurrent() {
  if (list.value) {
    try {
      await listsStore.updateList(listId.value, { recurring: !list.value.recurring })
      showSuccess(
        list.value.recurring ? 'Removed from recurring lists' : 'Added to recurring lists',
      )
    } catch {
      showError('Failed to update list')
    }
  }
}

function handleShareList() {
  shareEmail.value = ''
  shareError.value = ''
  shareLoading.value = false
  showShareDialog.value = true
}

async function submitShareList() {
  if (shareEmail.value.trim() && !shareLoading.value) {
    shareLoading.value = true
    shareError.value = ''
    try {
      await listsStore.shareList(listId.value, shareEmail.value.trim())
      shareEmail.value = ''
      shareLoading.value = false
      showShareDialog.value = false
      showSuccess('List shared successfully!')
    } catch (err: any) {
      shareError.value = err.message || 'Failed to share list'
      shareLoading.value = false
    }
  }
}

function handleAddProductFromDialog(product: Product) {
  selectedProductToAdd.value = product
  addQuantity.value = 1
  addUnit.value = (product.metadata as { unit?: string })?.unit || 'unit'
  showAddProductDialog.value = false
  showUnitQuantityDialog.value = true
}

async function confirmAddProduct() {
  if (selectedProductToAdd.value) {
    try {
      await productsStore.addItem(
        listId.value,
        selectedProductToAdd.value.id,
        addQuantity.value,
        addUnit.value,
      )
      showUnitQuantityDialog.value = false
      selectedProductToAdd.value = null
      productSearchQuery.value = ''
    } catch (err: unknown) {
      console.error('Failed to add product:', err)
      const errorMessage = (err as Error)?.message || 'Failed to add product to list'
      showError(`Failed to add product: ${errorMessage}`)
    }
  }
}

function handleCreateProductInDialog() {
  showCreateProductInDialog.value = true
  newProductName.value = productSearchQuery.value
}

function onCategoryChange(value: number | string) {
  if (value === 'create_new') {
    showInlineCategoryCreate.value = true
    newProductCategoryId.value = null
  } else {
    showInlineCategoryCreate.value = false
    newProductCategoryId.value = value as number
  }
}

async function createInlineCategory() {
  if (inlineCategoryName.value.trim()) {
    try {
      const newCategory = await globalProductsStore.createCategory(inlineCategoryName.value.trim())
      inlineCategoryName.value = ''
      inlineCategoryError.value = ''
      showInlineCategoryCreate.value = false
      newProductCategoryId.value = newCategory.id
    } catch {
      inlineCategoryError.value = 'Failed to create category'
    }
  }
}

function handleEditCategory(categoryId: number, categoryName: string) {
  editingCategoryId.value = categoryId
  editCategoryName.value = categoryName
  showEditCategoryDialog.value = true
}

async function confirmEditCategory() {
  if (editingCategoryId.value && editCategoryName.value.trim()) {
    try {
      await globalProductsStore.updateCategory(editingCategoryId.value, {
        name: editCategoryName.value.trim(),
      })
      showEditCategoryDialog.value = false
      editingCategoryId.value = null
      editCategoryName.value = ''
    } catch (err) {
      alert('Failed to update category')
    }
  }
}

function handleDeleteCategory(categoryId: number, categoryName: string) {
  deleteCategoryId.value = categoryId
  deleteCategoryName.value = categoryName
  showDeleteCategoryDialog.value = true
}

async function confirmDeleteCategory() {
  if (deleteCategoryId.value) {
    try {
      await globalProductsStore.deleteCategory(deleteCategoryId.value)
      showDeleteCategoryDialog.value = false
      if (newProductCategoryId.value === deleteCategoryId.value) {
        newProductCategoryId.value = null
      }
      deleteCategoryId.value = null
      deleteCategoryName.value = ''
    } catch (err) {
      alert('Failed to delete category')
      showDeleteCategoryDialog.value = false
    }
  }
}

async function createAndAddProduct() {
  if (newProductName.value.trim() && newProductCategoryId.value) {
    try {
      await globalProductsStore.addProduct(
        newProductName.value.trim(),
        newProductCategoryId.value,
        undefined,
        {},
      )

      const newProduct = globalProductsStore.products[0]
      if (newProduct) {
        selectedProductToAdd.value = newProduct
        showCreateProductInDialog.value = false
        showAddProductDialog.value = false
        showUnitQuantityDialog.value = true
      }

      newProductName.value = ''
      newProductCategoryId.value = null
    } catch (err: unknown) {
      console.error('Failed to create product:', err)
      showError('Failed to create product')
    }
  }
}

function closeAddProductDialog() {
  showAddProductDialog.value = false
  showCreateProductInDialog.value = false
  productSearchQuery.value = ''
  newProductName.value = ''
  newProductCategoryId.value = null
  showInlineCategoryCreate.value = false
  inlineCategoryName.value = ''
  inlineCategoryError.value = ''

  disconnectDialogObserver()
}

const { setupObserver } = useInfiniteScroll({
  trigger: loadMoreTrigger,
  hasMore,
  loadingMore,
  onLoadMore: () => productsStore.loadMoreListItems(listId.value),
})

const { setupObserver: setupDialogObserver, disconnect: disconnectDialogObserver } =
  useInfiniteScroll({
    trigger: dialogLoadMoreTrigger,
    hasMore: computed(() => globalProductsStore.hasMore),
    loadingMore: computed(() => globalProductsStore.loadingMore),
    onLoadMore: () => globalProductsStore.loadMoreProducts(),
    rootMargin: '50px',
  })

watch(showAddProductDialog, (isOpen) => {
  if (isOpen && !showCreateProductInDialog.value) {
    setupDialogObserver()
  }
})

onMounted(async () => {
  isLoading.value = true

  if (!list.value) {
    try {
      const fetchedList = await listsStore.getListById(listId.value)
      if (fetchedList && !listsStore.lists.find((l) => l.id === fetchedList.id)) {
        listsStore.lists.push(fetchedList)
      }
    } catch (err) {
      console.error('Failed to load list:', err)
      router.push('/')
      return
    }
  }

  try {
    await productsStore.loadListItems(listId.value)
  } catch (err) {
    console.error('Failed to load list items:', err)
  }

  try {
    await globalProductsStore.fetchProducts()
  } catch (err) {
    console.error('Failed to load products:', err)
  }

  isLoading.value = false
  setupObserver()
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
      <div style="max-width: 900px; margin-left: auto; margin-right: auto">
        <v-btn variant="text" size="small" class="back-button mb-4" @click="router.push('/')">
          <v-icon size="18" class="mr-1">mdi-arrow-left</v-icon>
          Back
        </v-btn>

        <div class="d-flex align-start justify-space-between mb-8">
          <div class="list-header-info">
            <h1 class="page-title">{{ list.name }}</h1>
            <p v-if="list.description" class="list-description">{{ list.description }}</p>
          </div>
          <div class="header-actions">
            <v-menu :close-on-content-click="false" location="bottom end" offset="8">
              <template v-slot:activator="{ props: menuProps }">
                <v-btn
                  icon="mdi-dots-vertical"
                  variant="text"
                  size="small"
                  class="menu-button"
                  v-bind="menuProps"
                />
              </template>

              <v-card min-width="220" class="menu-card" elevation="8">
                <v-list class="menu-list" density="compact">
                  <v-list-item
                    v-if="isOwner"
                    @click="handleToggleRecurrent"
                    class="menu-item menu-item-recurring"
                    rounded="lg"
                  >
                    <template v-slot:prepend>
                      <v-icon
                        :icon="list.recurring ? 'mdi-star' : 'mdi-star-outline'"
                        size="20"
                        class="menu-icon"
                        :class="{ 'menu-icon-active': list.recurring }"
                      />
                    </template>
                    <v-list-item-title class="menu-text">
                      {{ list.recurring ? 'Remove from Recurring' : 'Mark as Recurring' }}
                    </v-list-item-title>
                  </v-list-item>

                  <v-divider v-if="isOwner" class="menu-divider" />

                  <v-list-item
                    v-if="isOwner"
                    @click="handleEditList"
                    class="menu-item"
                    rounded="lg"
                  >
                    <template v-slot:prepend>
                      <v-icon icon="mdi-pencil-outline" size="20" class="menu-icon" />
                    </template>
                    <v-list-item-title class="menu-text">Edit</v-list-item-title>
                  </v-list-item>

                  <v-list-item
                    v-if="isOwner"
                    @click="handleShareList"
                    class="menu-item"
                    rounded="lg"
                  >
                    <template v-slot:prepend>
                      <v-icon icon="mdi-share-variant-outline" size="20" class="menu-icon" />
                    </template>
                    <v-list-item-title class="menu-text">Share</v-list-item-title>
                  </v-list-item>

                  <v-divider v-if="isOwner" class="menu-divider" />

                  <v-list-item
                    v-if="isOwner"
                    @click="handleResetList"
                    class="menu-item"
                    rounded="lg"
                  >
                    <template v-slot:prepend>
                      <v-icon icon="mdi-refresh" size="20" class="menu-icon" />
                    </template>
                    <v-list-item-title class="menu-text">Reset Items</v-list-item-title>
                  </v-list-item>

                  <v-list-item @click="handlePurchaseList" class="menu-item" rounded="lg">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-cart-check" size="20" class="menu-icon" />
                    </template>
                    <v-list-item-title class="menu-text">Mark as Purchased</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-menu>
          </div>
        </div>
      </div>

      <div class="search-row mb-10" style="max-width: 900px; margin-left: auto; margin-right: auto">
        <SearchDropdown
          v-model="searchQuery"
          placeholder="Search products in this list..."
          :show-dropdown="false"
        />
        <v-btn
          class="add-product-btn"
          elevation="0"
          :height="44"
          @click="showAddProductDialog = true"
        >
          Add Product
          <v-icon size="20" class="ml-2">mdi-plus</v-icon>
        </v-btn>
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
            @update-quantity="(qty) => handleUpdateQuantity(item.id, qty)"
            @delete="handleDeleteProduct(item.id)"
            @edit="handleEditProduct(item.id)"
          />
        </div>

        <!-- Infinite scroll trigger -->
        <div v-if="!searchQuery" ref="loadMoreTrigger" class="load-more-trigger">
          <div v-if="loadingMore" class="text-center py-4">
            <v-progress-circular indeterminate color="primary" size="32" />
          </div>
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

      <BaseDialog v-model="showDeleteDialog" title="Remove Product" :max-width="450">
        <div class="delete-confirmation">
          <v-icon icon="mdi-alert-circle-outline" size="48" color="error" class="mb-4" />
          <p class="delete-message">
            Are you sure you want to remove <strong>{{ deleteProductName }}</strong> from this list?
          </p>
          <p class="delete-warning">This action cannot be undone.</p>
        </div>

        <template #actions="{ close }">
          <DialogButton variant="cancel" @click="close">Cancel</DialogButton>
          <DialogButton variant="danger" @click="confirmDeleteProduct">Remove</DialogButton>
        </template>
      </BaseDialog>

      <!-- Edit Item Dialog -->
      <BaseDialog v-model="showEditItemDialog" title="Edit Item" :max-width="500">
        <div v-if="editingItem" class="edit-item-content">
          <div class="product-info mb-4">
            <h3 class="product-name">{{ editingItem.product?.name || 'Product' }}</h3>
            <p class="product-category">
              {{ editingItem.product?.category?.name || 'No category' }}
            </p>
          </div>

          <div class="form-row">
            <BaseSelect
              v-model="editItemUnit"
              :items="unitOptions"
              item-title="title"
              item-value="value"
              label="Unit"
            />
            <BaseInput
              v-model.number="editItemAmount"
              type="number"
              step="0.01"
              min="0"
              label="Amount"
            />
          </div>
        </div>

        <template #actions="{ close }">
          <DialogButton variant="cancel" @click="close">Cancel</DialogButton>
          <DialogButton
            variant="primary"
            :disabled="!editItemAmount || editItemAmount <= 0"
            @click="confirmEditItem"
          >
            Save Changes
          </DialogButton>
        </template>
      </BaseDialog>

      <!-- Edit List Dialog -->
      <ListFormDialog
        v-model="showEditListDialog"
        title="Edit List"
        :name="editListName"
        :description="editListDescription"
        :recurring="editListRecurring"
        confirm-text="Save Changes"
        @update:name="editListName = $event"
        @update:description="editListDescription = $event"
        @update:recurring="editListRecurring = $event"
        @confirm="confirmEditList"
      />

      <BaseDialog v-model="showAddProductDialog" title="Add Product" :max-width="500">
        <div v-if="!showCreateProductInDialog">
          <SearchDropdown
            v-model="productSearchQuery"
            placeholder="Search products..."
            :show-dropdown="false"
            class="mb-4"
          />

          <div v-if="filteredDialogProducts.length > 0" class="product-list-container">
            <v-list class="product-list">
              <v-list-item
                v-for="product in filteredDialogProducts"
                :key="product.id"
                class="product-list-item"
                @click="handleAddProductFromDialog(product)"
              >
                <v-list-item-title>{{ product.name }}</v-list-item-title>
                <v-list-item-subtitle v-if="product.category">
                  {{ product.category.name }}
                </v-list-item-subtitle>
                <template v-slot:append>
                  <v-icon icon="mdi-plus" size="20" />
                </template>
              </v-list-item>

              <!-- Infinite scroll trigger -->
              <div ref="dialogLoadMoreTrigger" class="dialog-load-more-trigger">
                <div v-if="globalProductsStore.loadingMore" class="text-center py-2">
                  <v-progress-circular indeterminate color="primary" size="24" />
                </div>
              </div>
            </v-list>
          </div>

          <div v-else class="dialog-empty-state">
            <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-package-variant</v-icon>
            <p class="text-body-2 text-medium-emphasis">No products found</p>
          </div>

          <v-list-item class="create-product-item" @click="handleCreateProductInDialog">
            <template v-slot:prepend>
              <v-icon icon="mdi-plus-circle-outline" />
            </template>
            <v-list-item-title class="font-weight-medium"> Create New Product </v-list-item-title>
          </v-list-item>
        </div>

        <div v-else>
          <BaseInput v-model="newProductName" label="Product Name" class="mb-4" />

          <div v-if="!showInlineCategoryCreate" class="mb-4">
            <label class="category-label">Category</label>
            <div v-if="globalProductsStore.categories.length === 0" class="no-categories-message">
              <v-icon size="32" color="grey-lighten-1" class="mb-2">mdi-label-outline</v-icon>
              <p class="text-body-2 text-medium-emphasis">No categories available</p>
            </div>
            <div v-else class="category-list-container">
              <v-list class="category-list">
                <v-list-item
                  v-for="category in globalProductsStore.categories"
                  :key="category.id"
                  :class="['category-list-item', { 'selected': newProductCategoryId === category.id }]"
                  @click="newProductCategoryId = category.id"
                >
                  <v-list-item-title>{{ category.name }}</v-list-item-title>
                  <template v-slot:append>
                    <div class="category-actions">
                      <v-btn
                        icon="mdi-pencil-outline"
                        variant="text"
                        size="small"
                        @click.stop="handleEditCategory(category.id, category.name)"
                      />
                      <v-btn
                        icon="mdi-delete-outline"
                        variant="text"
                        size="small"
                        color="error"
                        @click.stop="handleDeleteCategory(category.id, category.name)"
                      />
                    </div>
                  </template>
                </v-list-item>
              </v-list>
            </div>
            <v-btn
              class="create-category-btn"
              variant="text"
              @click="showInlineCategoryCreate = true"
            >
              <v-icon size="20" class="mr-2">mdi-plus-circle-outline</v-icon>
              Create New Category
            </v-btn>
          </div>

          <div v-else class="mb-4">
            <BaseInput
              v-model="inlineCategoryName"
              label="Category name"
              placeholder="Enter category name"
              class="mb-3"
              @keyup.enter="createInlineCategory"
            />
            <BaseNotification
              v-if="inlineCategoryError"
              variant="text"
              type="error"
              :message="inlineCategoryError"
              :model-value="!!inlineCategoryError"
            />
            <div class="inline-category-actions">
              <DialogButton
                variant="cancel"
                @click="
                  () => {
                    showInlineCategoryCreate = false
                    inlineCategoryName = ''
                    inlineCategoryError = ''
                  }
                "
              >
                Cancel
              </DialogButton>
              <BaseButton
                variant="create-category"
                :disabled="!inlineCategoryName.trim()"
                @click="createInlineCategory"
              >
                Create
              </BaseButton>
            </div>
          </div>
        </div>

        <template #actions>
          <DialogButton
            v-if="!showCreateProductInDialog"
            variant="cancel"
            @click="closeAddProductDialog"
          >
            Cancel
          </DialogButton>
          <DialogButton v-else variant="cancel" @click="showCreateProductInDialog = false">
            Back
          </DialogButton>
          <DialogButton
            v-if="showCreateProductInDialog"
            variant="primary"
            :disabled="!newProductName.trim() || !newProductCategoryId"
            @click="createAndAddProduct"
          >
            Create & Add
          </DialogButton>
        </template>
      </BaseDialog>

      <BaseDialog v-model="showUnitQuantityDialog" title="Add to List" :max-width="450">
        <div v-if="selectedProductToAdd" class="unit-quantity-content">
          <p class="product-name-label">
            <strong>{{ selectedProductToAdd.name }}</strong>
          </p>

          <div class="form-row">
            <BaseInput v-model.number="addQuantity" type="number" label="Quantity" min="1" />
            <BaseSelect
              v-model="addUnit"
              :items="unitOptions"
              item-title="title"
              item-value="value"
              label="Unit"
            />
          </div>
        </div>

        <template #actions="{ close }">
          <DialogButton variant="cancel" @click="close">Cancel</DialogButton>
          <DialogButton
            variant="primary"
            :disabled="!addQuantity || addQuantity < 1"
            @click="confirmAddProduct"
          >
            Add to List
          </DialogButton>
        </template>
      </BaseDialog>

      <BaseDialog v-model="showEditCategoryDialog" title="Edit Category" :max-width="450">
        <BaseInput
          v-model="editCategoryName"
          label="Category Name"
          placeholder="Enter category name"
        />

        <template #actions="{ close }">
          <DialogButton variant="cancel" @click="close">Cancel</DialogButton>
          <DialogButton
            variant="primary"
            :disabled="!editCategoryName.trim()"
            @click="confirmEditCategory"
          >
            Save
          </DialogButton>
        </template>
      </BaseDialog>

      <ConfirmDialog
        v-model="showPurchaseDialog"
        title="Mark as Purchased"
        message="Mark this list as purchased? This will save it to history."
        confirm-text="Mark as Purchased"
        variant="success"
        @confirm="confirmPurchase"
      />

      <ConfirmDialog
        v-model="showResetDialog"
        title="Reset Items"
        message="Reset all items to unpurchased? This will uncheck all items in the list."
        confirm-text="Reset Items"
        variant="default"
        @confirm="confirmReset"
      />
    </v-container>
  </div>
</template>

<style scoped>
.list-view {
  min-height: 100vh;
}

.list-header-info {
  flex: 1;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #000;
  margin: 0;
}

.list-description {
  font-size: 1rem;
  color: #666;
  margin: 0.5rem 0 0 0;
  line-height: 1.4;
  max-width: 600px;
  word-break: break-word;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  margin-top: -0.25rem;
}

.back-button {
  color: #666 !important;
  text-transform: none;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem !important;
}

.back-button:hover {
  color: #000 !important;
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


.search-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.add-product-btn {
  background-color: #000 !important;
  color: #ffffff !important;
  text-transform: none;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 12px;
  flex-shrink: 0;
  min-width: 140px;
  transition: background-color 0.2s ease;
}

.add-product-btn:hover {
  background-color: #1a1a1a !important;
  color: white !important;
}

.product-list-container {
  max-height: 360px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  scrollbar-width: none;
  padding: 0.5rem;
}

.product-list-container::-webkit-scrollbar {
  display: none;
}

.product-list {
  padding: 0 !important;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.product-list-item {
  cursor: pointer;
  border-radius: 8px !important;
  padding: 0.75rem 1rem !important;
  transition: background-color 0.2s ease;
}

.product-list-item:hover {
  background-color: #f5f5f5;
  border-radius: 8px !important;
}

.dialog-empty-state {
  text-align: center;
  padding: 3rem 2rem;
}

.create-product-item {
  cursor: pointer;
  border-radius: 8px !important;
  margin-top: 0.5rem;
  padding: 0.75rem 1rem !important;
  transition: background-color 0.2s ease;
}

.create-product-item:hover {
  background-color: #f5f5f5;
  border-radius: 8px !important;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.inline-category-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}


.dialog-load-more-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
}

.load-more-trigger {
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}

.unit-quantity-content {
  padding: 1rem 0;
}

.product-name-label {
  font-size: 1.125rem;
  color: #212121;
  margin-bottom: 1.5rem;
  text-align: center;
}

.menu-button {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.menu-button:hover {
  opacity: 1;
}

.menu-card {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.menu-list {
  padding: 0.5rem;
  background: white;
}

.menu-list :deep(.v-list-item) {
  padding-left: 12px !important;
  padding-right: 12px !important;
}

.menu-item {
  cursor: pointer;
  min-height: 48px;
  padding: 0.5rem 0.75rem !important;
  transition: all 0.15s ease;
}

.menu-item:hover {
  background-color: #f5f5f5 !important;
}

.menu-item:active {
  background-color: #eeeeee !important;
}

.menu-icon {
  color: #616161;
  transition: color 0.15s ease;
}

.menu-icon-active {
  color: #ffa726 !important;
}

.menu-item:hover .menu-icon {
  color: #424242;
}

.menu-item:hover .menu-icon-active {
  color: #ffb74d !important;
}

.menu-text {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #212121;
  letter-spacing: -0.01em;
}

.menu-item-recurring:hover {
  background-color: #fff3cd !important;
}

.menu-item-recurring:hover .menu-icon {
  color: #ffa726 !important;
}

.menu-divider {
  margin: 0;
  border-color: rgba(0, 0, 0, 0.08);
}
</style>
