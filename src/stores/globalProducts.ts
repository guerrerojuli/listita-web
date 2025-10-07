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
    return products.value.filter((product) =>
      product.name.toLowerCase().includes(searchLower) ||
      product.category.name.toLowerCase().includes(searchLower),
    )
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

  async function addProduct(name: string, category_id: number, pantry_id?: number | null, metadata?: any) {
    const created = await apiFetch<Product>('/api/products', {
      method: 'POST',
      json: { name, category_id, pantry_id: pantry_id ?? null, metadata: metadata ?? {} },
    })
    products.value.unshift(created)
  }

  async function deleteProduct(id: number) {
    await apiFetch(`/api/products/${id}`, { method: 'DELETE' })
    const index = products.value.findIndex((product) => product.id === id)
    if (index !== -1) products.value.splice(index, 1)
  }

  async function updateProduct(id: number, updates: { name?: string; category_id?: number; pantry_id?: number | null; metadata?: any }) {
    const updated = await apiFetch<Product>(`/api/products/${id}`, { method: 'PUT', json: updates })
    const index = products.value.findIndex((p) => p.id === id)
    if (index !== -1) products.value[index] = updated
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
    addProduct,
    deleteProduct,
    updateProduct,
    updateSearch,
  }
})
