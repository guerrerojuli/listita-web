import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Product } from '@/types/product'

export const useProductsStore = defineStore('products', () => {
  // State
  const products = ref<Product[]>([
    {
      id: '1',
      name: 'Carne',
      quantity: 1,
      completed: true,
      listId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Fernet',
      quantity: 1,
      completed: false,
      listId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ])

  // Getters
  function getProductsByListId(listId: string): Product[] {
    return products.value.filter((product) => product.listId === listId)
  }

  // Actions
  function addProduct(listId: string, name: string) {
    const newProduct: Product = {
      id: Date.now().toString(),
      name,
      quantity: 1,
      completed: false,
      listId,
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

  function toggleComplete(id: string) {
    const product = products.value.find((p) => p.id === id)
    if (product) {
      product.completed = !product.completed
      product.updatedAt = new Date()
    }
  }

  function updateQuantity(id: string, quantity: number) {
    const product = products.value.find((p) => p.id === id)
    if (product && quantity > 0) {
      product.quantity = quantity
      product.updatedAt = new Date()
    }
  }

  function incrementQuantity(id: string) {
    const product = products.value.find((p) => p.id === id)
    if (product) {
      product.quantity++
      product.updatedAt = new Date()
    }
  }

  function decrementQuantity(id: string) {
    const product = products.value.find((p) => p.id === id)
    if (product && product.quantity > 1) {
      product.quantity--
      product.updatedAt = new Date()
    }
  }

  return {
    products,
    getProductsByListId,
    addProduct,
    deleteProduct,
    toggleComplete,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
  }
})
