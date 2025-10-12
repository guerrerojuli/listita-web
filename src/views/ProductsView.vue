<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import NavBar from '@/components/NavBar.vue'
import SearchDropdown from '@/components/SearchDropdown.vue'
import BaseDialog from '@/components/BaseDialog.vue'
import BaseInput from '@/components/BaseInput.vue'
import BaseSelect from '@/components/BaseSelect.vue'
import BaseNotification from '@/components/BaseNotification.vue'
import { useGlobalProductsStore } from '@/stores/globalProducts'
import GlobalProductCard from '@/components/GlobalProductCard.vue'

const productsStore = useGlobalProductsStore()
const { searchQuery, filteredProducts } = storeToRefs(productsStore)

const dialog = ref(false)
const editDialog = ref(false)
const newProductName = ref('')
const newProductError = ref('')
const newProductCategoryId = ref<number | null>(null)
const newProductUnit = ref<string | null>(null)
const newProductUnitValue = ref<number | null>(null)

const editingProduct = ref<any>(null)
const editProductName = ref('')
const editProductCategoryId = ref<number | null>(null)
const editProductUnit = ref<string | null>(null)
const editProductUnitValue = ref<number | null>(null)
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

const showDeleteDialog = ref(false)
const deleteProductId = ref<number | null>(null)
const deleteProductName = ref('')

const showInlineCategoryCreate = ref(false)
const inlineCategoryName = ref('')
const inlineCategoryError = ref('')

function handleAddProduct() {
  inlineCategoryName.value = ''
  inlineCategoryError.value = ''
  newProductError.value = ''
  dialog.value = true
}

function handleSearchEnter() {
  if (searchQuery.value.trim()) {
    newProductName.value = searchQuery.value.trim()
    searchQuery.value = ''
    newProductError.value = ''
    dialog.value = true
  }
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
    // Check if product already exists
    const existingProduct = productsStore.products.find(
      (product) => product.name.toLowerCase() === newProductName.value.trim().toLowerCase(),
    )

    if (existingProduct) {
      newProductError.value = 'A product with this name already exists'
      return
    }

    const metadata: any = {}
    if (newProductUnit.value && newProductUnit.value !== 'none')
      metadata.unit = newProductUnit.value
    if (newProductUnitValue.value !== null && !Number.isNaN(newProductUnitValue.value))
      metadata.unitValue = newProductUnitValue.value
    await productsStore.addProduct(
      newProductName.value.trim(),
      newProductCategoryId.value,
      undefined,
      metadata,
    )
    newProductName.value = ''
    newProductCategoryId.value = null
    newProductUnit.value = null
    newProductUnitValue.value = null
    newProductError.value = ''
    dialog.value = false
  }
}

function handleEditProduct(productId: string) {
  const product = productsStore.products.find((p) => String(p.id) === productId)
  if (product) {
    editingProduct.value = product
    editProductName.value = product.name
    editProductCategoryId.value = product.category?.id ?? null
    editProductUnit.value = (product.metadata as any)?.unit ?? null
    editProductUnitValue.value = (product.metadata as any)?.unitValue ?? null
    editDialog.value = true
  }
}

async function updateProduct() {
  if (editingProduct.value && editProductName.value.trim() && editProductCategoryId.value) {
    const metadata: any = { ...(editingProduct.value.metadata || {}) }
    if (editProductUnit.value && editProductUnit.value !== 'none')
      metadata.unit = editProductUnit.value
    else delete metadata.unit
    if (editProductUnitValue.value !== null && !Number.isNaN(editProductUnitValue.value))
      metadata.unitValue = editProductUnitValue.value
    else delete metadata.unitValue
    await productsStore.updateProduct(editingProduct.value.id, {
      name: editProductName.value.trim(),
      category_id: editProductCategoryId.value,
      metadata,
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
    // If we're deleting from edit dialog, close it too
    if (editDialog.value && editingProduct.value?.id === deletedId) {
      editDialog.value = false
      editingProduct.value = null
    }
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
  <NavBar />
  <div class="products-view">
    <v-container class="py-8">
      <div
        class="d-flex align-center justify-space-between mb-8"
        style="max-width: 900px; margin-left: auto; margin-right: auto"
      >
        <h1 class="page-title">Products</h1>
        <v-btn class="add-product-btn" elevation="0" @click="handleAddProduct"> Add Product </v-btn>
      </div>

      <div class="mb-10" style="max-width: 900px; margin-left: auto; margin-right: auto">
        <SearchDropdown
          v-model="searchQuery"
          placeholder="Search or create a product..."
          :show-dropdown="false"
          @enter="handleSearchEnter"
        />
        <v-fade-transition>
          <div v-if="searchQuery.trim()" class="search-hint mt-2">
            <v-icon size="small" class="mr-1">mdi-keyboard-return</v-icon>
            Press Enter to create "{{ searchQuery }}"
          </div>
        </v-fade-transition>
      </div>

      <div
        v-if="filteredProducts.length > 0"
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
      </div>

      <div v-else class="empty-state">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-package-variant</v-icon>
        <p class="text-h6 text-medium-emphasis">No products found</p>
      </div>

      <!-- Dialog for adding new product -->
      <BaseDialog v-model="dialog" title="Add product">
        <BaseInput v-model="newProductName" label="Name" class="mb-4" />

        <div v-if="!showInlineCategoryCreate" class="mb-4">
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
        <div class="form-row">
          <BaseSelect
            v-model="newProductUnit"
            :items="unitOptions"
            item-title="title"
            item-value="value"
            label="Unit"
          />
          <BaseInput v-model.number="newProductUnitValue" type="number" label="Value" />
        </div>

        <template #actions="{ close }">
          <div style="position: absolute; bottom: 80px; left: 24px; right: 24px">
            <BaseNotification
              v-if="newProductError"
              variant="text"
              type="error"
              :message="newProductError"
              :model-value="!!newProductError"
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

      <!-- Dialog for editing product -->
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
        <div class="form-row">
          <BaseSelect
            v-model="editProductUnit"
            :items="unitOptions"
            item-title="title"
            item-value="value"
            label="Unit"
          />
          <BaseInput v-model.number="editProductUnitValue" type="number" label="Value" />
        </div>

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

      <!-- Dialog for deleting product -->
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

.search-hint {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #666;
  padding: 0.5rem 0.75rem;
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
</style>
