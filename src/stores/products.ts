import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiFetch } from '@/api/client'
import type { ListItem } from '@/types/api'

export const useProductsStore = defineStore('products', () => {
  // State
  const items = ref<ListItem[]>([])

  // Getters
  function getItemsByListId(listId: number): ListItem[] {
    return items.value.filter((i) => (i as any).listId === listId)
  }

  // Actions
  async function loadListItems(listId: number, params?: Record<string, unknown>) {
    const data = await apiFetch<ListItem[]>(`/api/shopping-lists/${listId}/items`, {
      method: 'GET',
      query: params,
    })
    // Tag items with listId for local filtering convenience
    items.value = data.map((d) => Object.assign({}, d, { listId })) as any
  }

  async function addItem(listId: number, productId: number, quantity = 1, unit = 'unit') {
    const created = await apiFetch<ListItem>(`/api/shopping-lists/${listId}/items`, {
      method: 'POST',
      json: { product_id: productId, quantity, unit },
    })
    items.value.unshift(Object.assign({}, created, { listId }) as any)
  }

  async function deleteItem(listId: number, itemId: number) {
    await apiFetch(`/api/shopping-lists/${listId}/items/${itemId}`, { method: 'DELETE' })
    const index = items.value.findIndex((i) => i.id === itemId)
    if (index !== -1) items.value.splice(index, 1)
  }

  async function setPurchased(listId: number, itemId: number, purchased: boolean) {
    const updated = await apiFetch<ListItem>(`/api/shopping-lists/${listId}/items/${itemId}`, {
      method: 'PATCH',
      json: { purchased },
    })
    const idx = items.value.findIndex((i) => i.id === itemId)
    if (idx !== -1) items.value[idx] = Object.assign({}, updated, { listId }) as any
  }

  async function updateQuantity(listId: number, itemId: number, quantity: number, unit?: string) {
    const updated = await apiFetch<ListItem>(`/api/shopping-lists/${listId}/items/${itemId}`, {
      method: 'PUT',
      json: { quantity, ...(unit ? { unit } : {}) },
    })
    const idx = items.value.findIndex((i) => i.id === itemId)
    if (idx !== -1) items.value[idx] = Object.assign({}, updated, { listId }) as any
  }

  function incrementQuantity(listId: number, itemId: number) {
    const item = items.value.find((i) => i.id === itemId)
    if (item) updateQuantity(listId, itemId, item.quantity + 1, item.unit)
  }

  function decrementQuantity(listId: number, itemId: number) {
    const item = items.value.find((i) => i.id === itemId)
    if (item && item.quantity > 1) updateQuantity(listId, itemId, item.quantity - 1, item.unit)
  }

  return {
    items,
    loadListItems,
    getItemsByListId,
    addItem,
    deleteItem,
    setPurchased,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
  }
})
