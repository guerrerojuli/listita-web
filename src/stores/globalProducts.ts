import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GlobalProduct, Category } from '@/types/globalProduct'

export const useGlobalProductsStore = defineStore('globalProducts', () => {
  // State
  const products = ref<GlobalProduct[]>([
    {
      id: '1',
      name: 'Carne',
      price: 12000,
      categories: ['Carnes'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Fernet',
      price: 13000,
      categories: ['Alcohol', 'Bebidas'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      name: 'Mayonesa',
      price: 3000,
      categories: ['Aderezos'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ])

  const categories = ref<Category[]>([
    { id: '1', name: 'Carnes' },
    { id: '2', name: 'Alcohol' },
    { id: '3', name: 'Bebidas' },
    { id: '4', name: 'Aderezos' },
    { id: '5', name: 'Verduras' },
    { id: '6', name: 'Frutas' },
  ])

  const searchQuery = ref('')

  // Getters
  const filteredProducts = computed(() => {
    if (!searchQuery.value) return products.value
    return products.value.filter((product) => {
      const searchLower = searchQuery.value.toLowerCase()
      return (
        product.name.toLowerCase().includes(searchLower) ||
        product.categories.some((cat) => cat.toLowerCase().includes(searchLower))
      )
    })
  })

  // Actions
  function addProduct(name: string, price: number, categories: string[]) {
    const newProduct: GlobalProduct = {
      id: Date.now().toString(),
      name,
      price,
      categories,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    products.value.push(newProduct)
  }

  function deleteProduct(id: string) {
    const index = products.value.findIndex((product) => product.id === id)
    if (index !== -1) {
      products.value.splice(index, 1)
    }
  }

  function updateProduct(id: string, updates: Partial<GlobalProduct>) {
    const product = products.value.find((p) => p.id === id)
    if (product) {
      Object.assign(product, updates)
      product.updatedAt = new Date()
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
    addProduct,
    deleteProduct,
    updateProduct,
    updateSearch,
  }
})
