<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useGlobalProductsStore } from '@/stores/globalProducts'
import GlobalProductCard from '@/components/GlobalProductCard.vue'

const productsStore = useGlobalProductsStore()
const { searchQuery, filteredProducts } = storeToRefs(productsStore)

const dialog = ref(false)
const editDialog = ref(false)
const newProductName = ref('')
const newProductCategoryId = ref<number | null>(null)

const editingProduct = ref<any>(null)
const editProductName = ref('')
const editProductCategoryId = ref<number | null>(null)

const categoryDialog = ref(false)
const newCategoryName = ref('')
const categoryError = ref('')

function handleAddProduct() {
  dialog.value = true
}

function handleAddCategory() {
  newCategoryName.value = ''
  categoryError.value = ''
  categoryDialog.value = true
}

async function createNewCategory() {
  if (newCategoryName.value.trim()) {
    try {
      await productsStore.createCategory(newCategoryName.value.trim())
      newCategoryName.value = ''
      categoryDialog.value = false
    } catch (err: any) {
      categoryError.value = 'Failed to create category'
    }
  }
}

async function createNewProduct() {
  if (newProductName.value.trim() && newProductCategoryId.value) {
    await productsStore.addProduct(newProductName.value.trim(), newProductCategoryId.value)
    newProductName.value = ''
    newProductCategoryId.value = null
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
  if (confirm('Are you sure you want to delete this product?')) {
    productsStore.deleteProduct(Number(productId))
  }
}

// load initial data in sequence: categories first, then products to enrich with category
;(async () => {
  try {
    await productsStore.fetchCategories()
  } catch {}
  try {
    await productsStore.fetchProducts()
  } catch {}
})()
</script>

<template>
  <div class="products-view">
    <v-container class="py-8">
      <div class="d-flex align-center justify-space-between mb-8">
        <h1 class="page-title">Products</h1>
        <div class="d-flex gap-3">
          <v-btn class="add-product-btn" elevation="0" @click="handleAddCategory">
            Add Category
          </v-btn>
          <v-btn class="add-product-btn" elevation="0" @click="handleAddProduct"> Add Product </v-btn>
        </div>
      </div>

      <div class="mb-10" style="max-width: 900px; margin-left: auto; margin-right: auto">
        <v-text-field
          v-model="searchQuery"
          placeholder="Search categories or products"
          variant="outlined"
          density="comfortable"
          bg-color="white"
          rounded="lg"
          hide-details
          class="search-field"
        />
      </div>

      <div v-if="filteredProducts.length > 0" class="mb-10">
        <div class="products-grid">
          <GlobalProductCard
            v-for="product in filteredProducts"
            :key="product.id"
            :product="product"
            @edit="handleEditProduct(String(product.id))"
            @delete="handleDeleteProduct(String(product.id))"
          />
        </div>
      </div>

      <div v-else class="empty-state">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-package-variant</v-icon>
        <p class="text-h6 text-medium-emphasis">No products found</p>
      </div>

      <!-- Dialog for adding new product -->
      <v-dialog v-model="dialog" max-width="500" persistent>
        <v-card class="product-dialog">
          <div class="dialog-header">
            <h2 class="dialog-title">Add product</h2>
            <v-btn icon="mdi-close" variant="text" size="small" @click="dialog = false" />
          </div>

          <v-card-text class="dialog-content">
            <div class="form-field">
              <label class="field-label">Name</label>
              <v-text-field
                v-model="newProductName"
                variant="outlined"
                density="comfortable"
                hide-details
                placeholder="Enter product name"
              />
            </div>

            <div class="form-field">
              <label class="field-label">Category</label>
              <v-select
                v-model="newProductCategoryId"
                :items="productsStore.categories"
                item-title="name"
                item-value="id"
                variant="outlined"
                density="comfortable"
                hide-details
                placeholder="Select a category"
              />
            </div>
          </v-card-text>

          <v-card-actions class="dialog-actions">
            <v-btn class="btn-cancel" elevation="0" @click="dialog = false"> Cancel </v-btn>
            <v-btn
              class="btn-add"
              elevation="0"
              :disabled="!newProductName.trim() || !newProductCategoryId"
              @click="createNewProduct"
            >
              Add
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Dialog for editing product -->
      <v-dialog v-model="editDialog" max-width="500" persistent>
        <v-card class="product-dialog">
          <div class="dialog-header">
            <h2 class="dialog-title">Edit product</h2>
            <v-btn icon="mdi-close" variant="text" size="small" @click="editDialog = false" />
          </div>

          <v-card-text class="dialog-content">
            <div class="form-field">
              <label class="field-label">Name</label>
              <v-text-field
                v-model="editProductName"
                variant="outlined"
                density="comfortable"
                hide-details
                placeholder="Enter product name"
              />
            </div>

            <div class="form-field">
              <label class="field-label">Category</label>
              <v-select
                v-model="editProductCategoryId"
                :items="productsStore.categories"
                item-title="name"
                item-value="id"
                variant="outlined"
                density="comfortable"
                hide-details
                placeholder="Select a category"
              />
            </div>
          </v-card-text>

          <v-card-actions class="dialog-actions">
            <v-btn
              class="btn-remove"
              elevation="0"
              @click="
                () => {
                  if (editingProduct) {
                    handleDeleteProduct(editingProduct.id)
                    editDialog = false
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
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Dialog for adding new category -->
      <v-dialog v-model="categoryDialog" max-width="500" persistent>
        <v-card class="product-dialog">
          <div class="dialog-header">
            <h2 class="dialog-title">Add category</h2>
            <v-btn icon="mdi-close" variant="text" size="small" @click="categoryDialog = false" />
          </div>

          <v-card-text class="dialog-content">
            <v-alert v-if="categoryError" type="error" class="mb-4" density="comfortable">
              {{ categoryError }}
            </v-alert>
            <div class="form-field">
              <label class="field-label">Category Name</label>
              <v-text-field
                v-model="newCategoryName"
                variant="outlined"
                density="comfortable"
                hide-details
                placeholder="Enter category name"
                @keyup.enter="createNewCategory"
              />
            </div>
          </v-card-text>

          <v-card-actions class="dialog-actions">
            <v-btn class="btn-cancel" elevation="0" @click="categoryDialog = false"> Cancel </v-btn>
            <v-btn
              class="btn-add"
              elevation="0"
              :disabled="!newCategoryName.trim()"
              @click="createNewCategory"
            >
              Add
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<style scoped>
.products-view {
  background-color: #fafafa;
  min-height: calc(100vh - 72px);
}

.page-title {
  font-size: 3.5rem;
  font-weight: 700;
  color: #000;
  letter-spacing: -0.5px;
}

.add-product-btn {
  background-color: #000 !important;
  color: white !important;
  text-transform: none;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 6px;
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

.products-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

/* Dialog styles */
.product-dialog {
  border-radius: 12px;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 1rem 1.5rem;
}

.dialog-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #000;
  margin: 0;
}

.dialog-content {
  padding: 0 1.5rem 1.5rem 1.5rem !important;
}

.form-field {
  margin-bottom: 1.5rem;
}

.form-field:last-child {
  margin-bottom: 0;
}

.field-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #000;
  margin-bottom: 0.5rem;
}

.dialog-actions {
  padding: 1.5rem !important;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-cancel {
  background-color: #e0e0e0 !important;
  color: #424242 !important;
  text-transform: none;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 6px;
  padding: 0.5rem 1.5rem !important;
}

.btn-remove {
  background-color: #f44336 !important;
  color: white !important;
  text-transform: none;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 6px;
  padding: 0.5rem 1.5rem !important;
}

.btn-add {
  background-color: #000 !important;
  color: white !important;
  text-transform: none;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 6px;
  padding: 0.5rem 1.5rem !important;
}
</style>
