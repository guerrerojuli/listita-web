import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { CategoryApi, Category } from '@/api/category'
import { ProductApi, Product } from '@/api/product'
import type { Product as ProductType, Category as CategoryType } from '@/types/api'

export const useGlobalProductsStore = defineStore('globalProducts', () => {
  // State
  const products = ref<ProductType[]>([])
  const categories = ref<CategoryType[]>([])
  const searchQuery = ref('')

  // Getters
  const filteredProducts = computed(() => {
    if (!searchQuery.value) return products.value
    const searchLower = searchQuery.value.toLowerCase()
    return products.value.filter((product) => {
      const productName = (product.name ?? '').toLowerCase()
      const categoryName = (product.category?.name ?? '').toLowerCase()
      return productName.includes(searchLower) || categoryName.includes(searchLower)
    })
  })

  function mapCategory(data: CategoryType): CategoryType {
    // Return data as-is from API, no need to instantiate class
    return data
  }

  function mapProduct(data: ProductType): ProductType {
    // Return data as-is from API, no need to instantiate class
    return data
  }

  // Actions
  async function fetchProducts(params?: {
    name?: string
    category_id?: number
    pantry_id?: number
  }) {
    const result = await ProductApi.getAll(undefined, params)
    products.value = result.data.map((product) => mapProduct(product as unknown as ProductType))
  }

  async function fetchCategories(params?: { name?: string }) {
    const result = await CategoryApi.getAll(undefined, params)
    categories.value = result.data.map((category) =>
      mapCategory(category as unknown as CategoryType),
    )
  }

  async function createCategory(name: string, metadata?: Record<string, unknown>) {
    const category = new Category(name, undefined, metadata)
    const result = await CategoryApi.add(category)
    const created = mapCategory(result as unknown as CategoryType)
    categories.value.unshift(created)
    return created
  }

  async function updateCategory(
    id: number,
    updates: { name?: string; metadata?: Record<string, unknown> },
  ) {
    const category = await CategoryApi.get(id)
    const updatedCategory = Object.assign(category, updates)
    const result = await CategoryApi.modify(updatedCategory)
    const updated = mapCategory(result as unknown as CategoryType)
    const index = categories.value.findIndex((c) => c.id === id)
    if (index !== -1) categories.value[index] = updated
    return updated
  }

  async function deleteCategory(id: number) {
    await CategoryApi.remove(id)
    const index = categories.value.findIndex((c) => c.id === id)
    if (index !== -1) categories.value.splice(index, 1)
  }

  async function addProduct(
    name: string,
    category_id: number,
    pantry_id?: number | null,
    metadata?: unknown,
  ) {
    const product = new Product(
      name,
      { id: category_id },
      undefined,
      pantry_id,
      metadata as Record<string, unknown>,
    )
    const result = await ProductApi.add(product)
    const created = mapProduct(result as unknown as ProductType)
    products.value.unshift(created)
  }

  async function deleteProduct(id: number) {
    await ProductApi.remove(id)
    const index = products.value.findIndex((product) => product.id === id)
    if (index !== -1) products.value.splice(index, 1)
  }

  async function updateProduct(
    id: number,
    updates: { name?: string; category_id?: number; pantry_id?: number | null; metadata?: unknown },
  ) {
    const product = await ProductApi.get(id)
    if (updates.name !== undefined) {
      product.name = updates.name
    }
    if (updates.category_id !== undefined) {
      product.category = { id: updates.category_id }
    }
    if (updates.metadata !== undefined) {
      product.metadata = updates.metadata as Record<string, unknown>
    }
    const result = await ProductApi.modify(product)
    const updated: ProductType = ('product' in result
      ? result.product
      : result) as unknown as ProductType
    const index = products.value.findIndex((p) => p.id === id)
    if (index !== -1) {
      products.value.splice(index, 1, mapProduct(updated))
    }
  }

  function updateSearch(query: string) {
    searchQuery.value = query
  }

  return {
    products,
    categories,
    searchQuery,
    filteredProducts,
    fetchProducts,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    addProduct,
    deleteProduct,
    updateProduct,
    updateSearch,
  }
})
