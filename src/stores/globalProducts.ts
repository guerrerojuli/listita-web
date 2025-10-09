import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiFetch } from '@/api/client'
import type { Product, Category } from '@/types/api'

export const useGlobalProductsStore = defineStore('globalProducts', () => {
  // State
  const products = ref<Product[]>([])
  const categories = ref<Category[]>([])

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

  // Actions
  async function fetchProducts(params?: {
    name?: string
    category_id?: number
    pantry_id?: number
  }) {
    const data = await apiFetch<Product[]>('/api/products', { method: 'GET', query: params })
    products.value = data
  }

  async function fetchCategories(params?: { name?: string }) {
    const data = await apiFetch<Category[]>('/api/categories', { method: 'GET', query: params as any })
    categories.value = data as any
  }

  async function createCategory(name: string, metadata?: Record<string, unknown>) {
    const created = await apiFetch<Category>('/api/categories', {
      method: 'POST',
      json: { name, metadata: metadata ?? {} },
    })
    categories.value.unshift(created)
    return created
  }

  async function updateCategory(id: number, updates: { name?: string; metadata?: Record<string, unknown> }) {
    const updated = await apiFetch<Category>(`/api/categories/${id}`, {
      method: 'PUT',
      json: updates,
    })
    const index = categories.value.findIndex((c) => c.id === id)
    if (index !== -1) categories.value[index] = updated
    return updated
  }

  async function deleteCategory(id: number) {
    await apiFetch(`/api/categories/${id}`, { method: 'DELETE' })
    const index = categories.value.findIndex((c) => c.id === id)
    if (index !== -1) categories.value.splice(index, 1)
  }

  async function addProduct(name: string, category_id: number, pantry_id?: number | null, metadata?: any) {
    const created = await apiFetch<Product>('/api/products', {
      method: 'POST',
      json: { name, category: { id: category_id }, pantry_id: pantry_id ?? null, metadata: metadata ?? {} },
    })
    products.value.unshift(created)
  }

  async function deleteProduct(id: number) {
    await apiFetch(`/api/products/${id}`, { method: 'DELETE' })
    const index = products.value.findIndex((product) => product.id === id)
    if (index !== -1) products.value.splice(index, 1)
  }

  async function updateProduct(id: number, updates: { name?: string; category_id?: number; pantry_id?: number | null; metadata?: any }) {
    const payload: any = {}
    if (updates.name !== undefined) {
      payload.name = updates.name
    }
    if (updates.category_id !== undefined) {
      payload.category = { id: updates.category_id }
    }
    if (updates.metadata !== undefined) {
      payload.metadata = updates.metadata
    }
    const response = await apiFetch<any>(`/api/products/${id}`, { method: 'PUT', json: payload })    
    const updated: Product = response.product || response    
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
