import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiFetch } from '@/api/client'
import type { ShoppingList, ListItem, User } from '@/types/api'

export interface Purchase {
  id: number
  metadata?: Record<string, unknown> | null
  owner: User
  list: ShoppingList
  listItemArray: ListItem[]
  createdAt?: string
}

export const usePurchasesStore = defineStore('purchases', () => {
  const purchases = ref<Purchase[]>([])
  const loading = ref(false)

  async function fetchPurchases(params?: {
    list_id?: number
    page?: number
    per_page?: number
    sort_by?: 'createdAt' | 'list' | 'id'
    order?: 'ASC' | 'DESC'
  }) {
    loading.value = true
    try {
      const data = await apiFetch<{ data: Purchase[] }>('/api/purchases', {
        method: 'GET',
        query: params as any,
      })
      purchases.value = data.data || []
      return data.data || []
    } finally {
      loading.value = false
    }
  }

  async function getPurchaseById(id: number) {
    const purchase = await apiFetch<Purchase>(`/api/purchases/${id}`, {
      method: 'GET',
    })
    return purchase
  }

  async function restorePurchase(id: number) {
    const restoredList = await apiFetch<ShoppingList>(`/api/purchases/${id}/restore`, {
      method: 'POST',
    })
    return restoredList
  }

  function getPurchasesByListId(listId: number): Purchase[] {
    return purchases.value.filter((p) => p.list.id === listId)
  }

  return {
    purchases,
    loading,
    fetchPurchases,
    getPurchaseById,
    restorePurchase,
    getPurchasesByListId,
  }
})
