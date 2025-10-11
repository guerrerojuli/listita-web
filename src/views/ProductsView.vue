<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import NavBar from '@/components/NavBar.vue'
import BaseDialog from '@/components/BaseDialog.vue'
import BaseInput from '@/components/BaseInput.vue'
import BaseSelect from '@/components/BaseSelect.vue'
import { useGlobalProductsStore } from '@/stores/globalProducts'
import GlobalProductCard from '@/components/GlobalProductCard.vue'

const productsStore = useGlobalProductsStore()
const { searchQuery, filteredProducts } = storeToRefs(productsStore)

const dialog = ref(false)
const editDialog = ref(false)
const newProductName = ref('')
const newProductCategoryId = ref<number | null>(null)
const newProductUnit = ref<string | null>(null)
const newProductUnitValue = ref<number | null>(null)

const editingProduct = ref<any>(null)
const editProductName = ref('')
const editProductCategoryId = ref<number | null>(null)
const editProductUnit = ref<string | null>(null)
const editProductUnitValue = ref<number | null>(null)
const unitOptions = [
  { title: 'Sin medida', value: 'none' },
  { title: 'Unidad', value: 'unit' },
  { title: 'Litros', value: 'liters' },
  { title: 'Mililitros', value: 'milliliters' },
  { title: 'Kilos', value: 'kilograms' },
  { title: 'Gramos', value: 'grams' },
  { title: 'Volumen', value: 'volume' },
  { title: 'Pack', value: 'pack' },
  { title: 'Libras', value: 'pounds' },
  { title: 'Onzas', value: 'ounces' },
  { title: 'Centímetros', value: 'centimeters' },
  { title: 'Metros', value: 'meters' },
]

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
  <NavBar />
  <div class="products-view">
    <v-container class="py-8">
      <div class="d-flex align-center justify-space-between mb-8">
        <h1 class="page-title">Products</h1>
        <div class="d-flex buttons-row">
          <v-btn class="add-product-btn" elevation="0" @click="handleAddCategory">
            Add Category
          </v-btn>
          <v-btn class="add-product-btn" elevation="0" @click="handleAddProduct">
            Add Product
          </v-btn>
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
      <BaseDialog v-model="dialog" title="Add product">
        <BaseInput v-model="newProductName" label="Name" class="mb-4" />
        <BaseSelect
          v-model="newProductCategoryId"
          :items="productsStore.categories"
          item-title="name"
          item-value="id"
          label="Category"
          class="mb-4"
        />
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

        <template #actions="{ close }">
          <v-btn
            class="btn-remove"
            elevation="0"
            @click="
              () => {
                if (editingProduct) {
                  handleDeleteProduct(editingProduct.id)
                  close()
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

      <!-- Dialog for adding new category -->
      <BaseDialog v-model="categoryDialog" title="Add category">
        <v-alert v-if="categoryError" type="error" class="mb-4" density="comfortable">
          {{ categoryError }}
        </v-alert>
        <BaseInput
          v-model="newCategoryName"
          label="Category name"
          @keyup.enter="createNewCategory"
        />

        <template #actions="{ close }">
          <v-btn class="btn-cancel" elevation="0" @click="close">Cancel</v-btn>
          <v-btn
            class="btn-add"
            elevation="0"
            :disabled="!newCategoryName.trim()"
            @click="createNewCategory"
          >
            Add
          </v-btn>
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

.form-row {
  display: flex;
  gap: 1rem;
}

.buttons-row {
  gap: 12px;
}
</style>
