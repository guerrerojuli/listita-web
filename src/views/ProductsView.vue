<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import NavBar from '@/components/NavBar.vue'
import SearchDropdown from '@/components/SearchDropdown.vue'
import BaseDialog from '@/components/BaseDialog.vue'
import BaseInput from '@/components/BaseInput.vue'
import BaseSelect from '@/components/BaseSelect.vue'
import BaseNotification from '@/components/BaseNotification.vue'
import { useGlobalProductsStore } from '@/stores/globalProducts'
import GlobalProductCard from '@/components/GlobalProductCard.vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'

const productsStore = useGlobalProductsStore()
const { searchQuery, filteredProducts, loading, error, hasMore, loadingMore } =
  storeToRefs(productsStore)

const loadMoreTrigger = ref<HTMLElement | null>(null)

const dialog = ref(false)
const editDialog = ref(false)
const newProductName = ref('')
const newProductWarning = ref('')
const newProductCategoryId = ref<number | null>(null)

const editingProduct = ref<any>(null)
const editProductName = ref('')
const editProductCategoryId = ref<number | null>(null)

const showDeleteDialog = ref(false)
const deleteProductId = ref<number | null>(null)
const deleteProductName = ref('')

const showInlineCategoryCreate = ref(false)
const inlineCategoryName = ref('')
const inlineCategoryError = ref('')

function handleAddProduct() {
  inlineCategoryName.value = ''
  inlineCategoryError.value = ''
  newProductWarning.value = ''
  dialog.value = true
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
      const newCategory = await productsStore.createCategory(inlineCategoryName.value.trim())
      inlineCategoryName.value = ''
      inlineCategoryError.value = ''
      showInlineCategoryCreate.value = false
      newProductCategoryId.value = newCategory.id
    } catch (err) {
      inlineCategoryError.value = 'Failed to create category'
    }
  }
}

async function createNewProduct() {
  if (newProductName.value.trim() && newProductCategoryId.value) {
    const existingProduct = productsStore.products.find(
      (product) => product.name.toLowerCase() === newProductName.value.trim().toLowerCase(),
    )

    if (existingProduct) {
      newProductWarning.value = 'A product with this name already exists'
      return
    }

    await productsStore.addProduct(
      newProductName.value.trim(),
      newProductCategoryId.value,
      undefined,
      {},
    )
    newProductName.value = ''
    newProductCategoryId.value = null
    newProductWarning.value = ''
    dialog.value = false
  }
}

function handleEditProduct(productId: string) {
  const product = productsStore.products.find((p) => String(p.id) === productId)
  if (product) {
    editingProduct.value = product
    editProductName.value = product.name
    editProductCategoryId.value = product.category?.id ?? null
    editDialog.value = true
  }
}

async function updateProduct() {
  if (editingProduct.value && editProductName.value.trim() && editProductCategoryId.value) {
    await productsStore.updateProduct(editingProduct.value.id, {
      name: editProductName.value.trim(),
      category_id: editProductCategoryId.value,
    })
    editDialog.value = false
    editingProduct.value = null
  }
}

function handleDeleteProduct(productId: string) {
  const product = productsStore.products.find((p) => String(p.id) === productId)
  if (product) {
    deleteProductId.value = Number(productId)
    deleteProductName.value = product.name
    showDeleteDialog.value = true
  }
}

async function confirmDeleteProduct() {
  if (deleteProductId.value) {
    const deletedId = deleteProductId.value
    await productsStore.deleteProduct(deletedId)
    showDeleteDialog.value = false
    deleteProductId.value = null
    deleteProductName.value = ''
    if (editDialog.value && editingProduct.value?.id === deletedId) {
      editDialog.value = false
      editingProduct.value = null
    }
  }
}

const { setupObserver } = useInfiniteScroll({
  trigger: loadMoreTrigger,
  hasMore,
  loadingMore,
  onLoadMore: () => productsStore.loadMoreProducts(),
})

onMounted(async () => {
  try {
    await productsStore.fetchCategories()
  } catch {}
  try {
    await productsStore.fetchProducts()
  } catch {}

  setupObserver()
})

watch(
  () => filteredProducts.value.length,
  (newLength) => {
    if (newLength > 0) {
      setupObserver()
    }
  },
)
</script>

<template>
  <NavBar />
  <div class="products-view">
    <v-container class="py-8">
      <h1 class="page-title">Products</h1>

      <div v-if="!error" class="search-row mb-10">
        <SearchDropdown
          v-model="searchQuery"
          placeholder="Search products..."
          :show-dropdown="false"
        />
        <v-btn class="add-product-btn" elevation="0" :height="44" @click="handleAddProduct">
          Add Product
          <v-icon size="20" class="ml-2">mdi-plus</v-icon>
        </v-btn>
      </div>

      <div v-if="loading" class="empty-state">
        <v-progress-circular indeterminate color="primary" size="64" class="mb-4" />
        <p class="text-h6 text-medium-emphasis">Loading products...</p>
      </div>

      <div v-else-if="error" class="empty-state">
        <v-icon size="64" color="error" class="mb-4">mdi-alert-circle-outline</v-icon>
        <p class="text-h6 text-medium-emphasis">{{ error }}</p>
      </div>

      <div
        v-else-if="filteredProducts.length > 0"
        class="mb-10"
        style="max-width: 900px; margin-left: auto; margin-right: auto"
      >
        <div class="products-grid">
          <GlobalProductCard
            v-for="product in filteredProducts"
            :key="product.id"
            :product="product"
            @edit="handleEditProduct(String(product.id))"
            @delete="handleDeleteProduct(String(product.id))"
          />
        </div>

        <!-- Infinite scroll trigger -->
        <div ref="loadMoreTrigger" class="load-more-trigger">
          <div v-if="loadingMore" class="text-center py-4">
            <v-progress-circular indeterminate color="primary" size="32" />
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-package-variant</v-icon>
        <p class="text-h6 text-medium-emphasis">No products to add</p>
      </div>

      <BaseDialog v-model="dialog" title="Add product">
        <BaseInput v-model="newProductName" label="Name" class="mb-4" />

        <div v-if="!showInlineCategoryCreate">
          <v-select
            :model-value="newProductCategoryId"
            :items="[
              ...productsStore.categories.map((c) => ({ title: c.name, value: c.id })),
              { title: '+ Create New Category', value: 'create_new' },
            ]"
            item-title="title"
            item-value="value"
            label="Category"
            variant="outlined"
            density="comfortable"
            @update:model-value="onCategoryChange"
          />
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
            <v-btn
              class="btn-cancel"
              elevation="0"
              @click="
                () => {
                  showInlineCategoryCreate = false
                  inlineCategoryName = ''
                  inlineCategoryError = ''
                }
              "
            >
              Cancel
            </v-btn>
            <v-btn
              class="btn-create-category"
              elevation="0"
              :disabled="!inlineCategoryName.trim()"
              @click="createInlineCategory"
            >
              Create
            </v-btn>
          </div>
        </div>

        <template #actions="{ close }">
          <div style="position: absolute; bottom: 80px; left: 24px; right: 24px">
            <BaseNotification
              v-if="newProductWarning"
              variant="text"
              type="warning"
              :message="newProductWarning"
              :model-value="!!newProductWarning"
            />
          </div>
          <v-btn class="btn-cancel" elevation="0" @click="close">Cancel</v-btn>
          <v-btn
            class="btn-add"
            elevation="0"
            :disabled="!newProductName.trim() || !newProductCategoryId"
            @click="createNewProduct"
          >
            Add
          </v-btn>
        </template>
      </BaseDialog>

      <BaseDialog v-model="editDialog" title="Edit product">
        <BaseInput v-model="editProductName" label="Name" class="mb-4" />
        <BaseSelect
          v-model="editProductCategoryId"
          :items="productsStore.categories"
          item-title="name"
          item-value="id"
          label="Category"
          class="mb-4"
        />

        <template #actions>
          <v-btn
            class="btn-remove"
            elevation="0"
            @click="
              () => {
                if (editingProduct) {
                  handleDeleteProduct(String(editingProduct.id))
                }
              }
            "
          >
            Remove
          </v-btn>
          <v-btn
            class="btn-add"
            elevation="0"
            :disabled="!editProductName.trim() || !editProductCategoryId"
            @click="updateProduct"
          >
            Save
          </v-btn>
        </template>
      </BaseDialog>

      <BaseDialog v-model="showDeleteDialog" title="Delete Product" :max-width="450">
        <div class="delete-confirmation">
          <v-icon icon="mdi-alert-circle-outline" size="48" color="error" class="mb-4" />
          <p class="delete-message">
            Are you sure you want to delete <strong>{{ deleteProductName }}</strong
            >?
          </p>
          <p class="delete-warning">This action cannot be undone.</p>
        </div>

        <template #actions="{ close }">
          <v-btn class="btn-cancel" elevation="0" @click="close">Cancel</v-btn>
          <v-btn class="btn-remove" elevation="0" @click="confirmDeleteProduct">Delete</v-btn>
        </template>
      </BaseDialog>
    </v-container>
  </div>
</template>

<style scoped>
.products-view {
  min-height: 100vh;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #000;
  max-width: 900px;
  margin: 0 auto 2rem auto;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}

.add-product-btn {
  background-color: #999999 !important;
  color: #ffffff !important;
  text-transform: none;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid #838383 !important;
  border-radius: 12px;
  flex-shrink: 0;
  min-width: 140px;
  transition: background-color 0.2s ease;
}

.add-product-btn:hover {
  background-color: #757575 !important;
  color: white !important;
}

.search-hint {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #666;
  padding: 0 0.75rem 0.5rem 0.75rem;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
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

.form-row {
  display: flex;
  gap: 1rem;
}

.inline-category-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn-create-category {
  background-color: #000 !important;
  color: white !important;
  text-transform: none;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 6px;
  padding: 0 1.5rem !important;
}

.btn-create-category:hover {
  background-color: #1a1a1a !important;
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

.load-more-trigger {
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}
</style>
