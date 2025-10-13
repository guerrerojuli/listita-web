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

const showEditCategoryDialog = ref(false)
const editingCategoryId = ref<number | null>(null)
const editCategoryName = ref('')

const showDeleteCategoryDialog = ref(false)
const deleteCategoryId = ref<number | null>(null)
const deleteCategoryName = ref('')

function handleAddProduct() {
  inlineCategoryName.value = ''
  inlineCategoryError.value = ''
  newProductWarning.value = ''
  dialog.value = true
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

function handleEditCategory(categoryId: number, categoryName: string) {
  editingCategoryId.value = categoryId
  editCategoryName.value = categoryName
  showEditCategoryDialog.value = true
}

async function confirmEditCategory() {
  if (editingCategoryId.value && editCategoryName.value.trim()) {
    try {
      await productsStore.updateCategory(editingCategoryId.value, {
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
      await productsStore.deleteCategory(deleteCategoryId.value)
      showDeleteCategoryDialog.value = false
      deleteCategoryId.value = null
      deleteCategoryName.value = ''
      if (newProductCategoryId.value === deleteCategoryId.value) {
        newProductCategoryId.value = null
      }
      if (editProductCategoryId.value === deleteCategoryId.value) {
        editProductCategoryId.value = null
      }
    } catch (err) {
      alert('Failed to delete category')
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
          <div class="category-label">Category</div>
          <div v-if="productsStore.categories.length === 0" class="no-categories-message">
            <v-icon size="32" color="grey-lighten-1" class="mb-2">mdi-label-outline</v-icon>
            <p class="text-body-2 text-medium-emphasis">No categories available</p>
          </div>
          <div v-else class="category-list-container">
            <v-list class="category-list">
              <v-list-item
                v-for="category in productsStore.categories"
                :key="category.id"
                :class="['category-list-item', { selected: newProductCategoryId === category.id }]"
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
          <v-btn class="create-category-btn" elevation="0" @click="showInlineCategoryCreate = true">
            + Create New Category
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

      <BaseDialog v-model="showEditCategoryDialog" title="Edit Category" :max-width="450">
        <BaseInput v-model="editCategoryName" label="Category name" class="mb-4" />

        <template #actions="{ close }">
          <v-btn class="btn-cancel" elevation="0" @click="close">Cancel</v-btn>
          <v-btn
            class="btn-add"
            elevation="0"
            :disabled="!editCategoryName.trim()"
            @click="confirmEditCategory"
          >
            Save
          </v-btn>
        </template>
      </BaseDialog>

      <BaseDialog v-model="showDeleteCategoryDialog" title="Delete Category" :max-width="450">
        <div class="delete-confirmation">
          <v-icon icon="mdi-alert-circle-outline" size="48" color="error" class="mb-4" />
          <p class="delete-message">
            Are you sure you want to delete <strong>{{ deleteCategoryName }}</strong
            >?
          </p>
          <p class="delete-warning">This action cannot be undone.</p>
        </div>

        <template #actions="{ close }">
          <v-btn class="btn-cancel" elevation="0" @click="close">Cancel</v-btn>
          <v-btn class="btn-remove" elevation="0" @click="confirmDeleteCategory">Delete</v-btn>
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

.category-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #616161;
  margin-bottom: 0.5rem;
}

.no-categories-message {
  text-align: center;
  padding: 2rem 1rem;
  color: #757575;
}

.category-list-container {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  scrollbar-width: none;
}

.category-list-container::-webkit-scrollbar {
  display: none;
}

.category-list {
  padding: 0.5rem !important;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.category-list-item {
  cursor: pointer;
  border-radius: 8px !important;
  padding: 0.375rem 0.75rem !important;
  transition: background-color 0.2s ease;
}

.category-list-item:hover {
  background-color: #f5f5f5 !important;
}

.category-list-item.selected {
  background-color: #e0e0e0 !important;
}

.category-list-item.selected:hover {
  background-color: #d0d0d0 !important;
}

.category-actions {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}

.create-category-btn {
  background-color: #f5f5f5 !important;
  color: #000 !important;
  text-transform: none;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 8px;
  width: 100%;
  margin-top: 0.5rem;
}

.create-category-btn:hover {
  background-color: #eeeeee !important;
}
</style>
