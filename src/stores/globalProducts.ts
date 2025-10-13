import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { CategoryApi, Category } from '@/api/category'
import { ProductApi, Product } from '@/api/product'
import type { Product as ProductType, Category as CategoryType } from '@/types/api'

export const useGlobalProductsStore = defineStore('globalProducts', () => {
  const products = ref<ProductType[]>([])
  const categories = ref<CategoryType[]>([])
  const searchQuery = ref('')
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const hasMore = ref(true)
  const loadingMore = ref(false)

  const filteredProducts = computed(() => {
    if (!searchQuery.value) return products.value
    const searchLower = searchQuery.value.toLowerCase()
    return products.value.filter((product) => {
      const productName = (product.name ?? '').toLowerCase()
      const categoryName = (product.category?.name ?? '').toLowerCase()
      return productName.includes(searchLower) || categoryName.includes(searchLower)
    })
  })

  function getErrorMessage(err: any): string {
    if (!err) return 'Something went wrong. Please try again.'

    const errorMessage = err.message || ''

    if (
      errorMessage.includes('Failed to fetch') ||
      errorMessage.includes('Network Error') ||
      errorMessage.includes('network')
    ) {
      return 'Unable to connect to the server. Please check your internet connection and try again.'
    }

    if (err.status >= 500) {
      return 'The server is currently unavailable. Please try again later.'
    }

    return errorMessage || 'Something went wrong. Please try again.'
  }

  async function fetchProducts(params?: {
    name?: string
    category_id?: number
    pantry_id?: number
  }) {
    loading.value = true
    error.value = null
    currentPage.value = 1
    hasMore.value = true

    try {
      const result = await ProductApi.getAll(undefined, { ...params, page: 1, per_page: 10 })
      products.value = result.data as ProductType[]
      hasMore.value = result.pagination?.has_next ?? false
    } catch (err: any) {
      error.value = getErrorMessage(err)
      products.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  async function loadMoreProducts(params?: {
    name?: string
    category_id?: number
    pantry_id?: number
  }) {
    if (loadingMore.value || !hasMore.value) return

    loadingMore.value = true

    try {
      currentPage.value += 1
      const result = await ProductApi.getAll(undefined, {
        ...params,
        page: currentPage.value,
        per_page: 10,
      })
      const newProducts = result.data as ProductType[]
      products.value = [...products.value, ...newProducts]
      hasMore.value = result.pagination?.has_next ?? false
    } catch (err: any) {
      console.error('Failed to load more products:', err)
      currentPage.value -= 1
    } finally {
      loadingMore.value = false
    }
  }

  async function fetchCategories(params?: { name?: string }) {
    try {
      const result = await CategoryApi.getAll(undefined, params)
      categories.value = result.data as CategoryType[]
    } catch (err: any) {
      categories.value = []
    }
  }

  async function createCategory(name: string, metadata?: Record<string, unknown>) {
    const category = new Category(name, undefined, metadata)
    const result = await CategoryApi.add(category)
    const created = result as CategoryType
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
    const updated = result as CategoryType
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
    const created = result as ProductType
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
    const updated = result as ProductType
    const index = products.value.findIndex((p) => p.id === id)
    if (index !== -1) {
      products.value.splice(index, 1, updated)
    }
  }

  function updateSearch(query: string) {
    searchQuery.value = query
  }

  return {
    products,
    categories,
    searchQuery,
    loading,
    error,
    currentPage,
    hasMore,
    loadingMore,
    filteredProducts,
    fetchProducts,
    loadMoreProducts,
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
