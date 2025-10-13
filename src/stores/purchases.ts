import { defineStore } from 'pinia'
import { ref } from 'vue'
import { PurchaseApi } from '@/api/purchase'
import type { Purchase as PurchaseType } from '@/types/api'

export const usePurchasesStore = defineStore('purchases', () => {
  const purchases = ref<PurchaseType[]>([])
  const loading = ref(false)
  const currentPage = ref(1)
  const hasMore = ref(true)
  const loadingMore = ref(false)

  async function fetchPurchases(params?: {
    list_id?: number
    page?: number
    per_page?: number
    sort_by?: 'createdAt' | 'list' | 'id'
    order?: 'ASC' | 'DESC'
  }) {
    loading.value = true
    currentPage.value = 1
    hasMore.value = true
    try {
      const result = await PurchaseApi.getAll(undefined, { ...params, page: 1, per_page: 10 })
      purchases.value = result.data as PurchaseType[]
      hasMore.value = result.pagination?.has_next ?? false
      return purchases.value
    } finally {
      loading.value = false
    }
  }

  async function loadMorePurchases(params?: {
    list_id?: number
    sort_by?: 'createdAt' | 'list' | 'id'
    order?: 'ASC' | 'DESC'
  }) {
    if (loadingMore.value || !hasMore.value) return

    loadingMore.value = true

    try {
      currentPage.value += 1
      const result = await PurchaseApi.getAll(undefined, {
        ...params,
        page: currentPage.value,
        per_page: 10,
      })
      const newPurchases = result.data as PurchaseType[]

      purchases.value = [...purchases.value, ...newPurchases]
      hasMore.value = result.pagination?.has_next ?? false
    } catch (err) {
      console.error('Failed to load more purchases:', err)
      currentPage.value -= 1
    } finally {
      loadingMore.value = false
    }
  }

  async function getPurchaseById(id: number) {
    const result = await PurchaseApi.get(id)
    return result as PurchaseType
  }

  async function restorePurchase(id: number) {
    return await PurchaseApi.restore(id)
  }

  function getPurchasesByListId(listId: number): PurchaseType[] {
    return purchases.value.filter((p) => p.list.id === listId)
  }

  return {
    purchases,
    loading,
    currentPage,
    hasMore,
    loadingMore,
    fetchPurchases,
    loadMorePurchases,
    getPurchaseById,
    restorePurchase,
    getPurchasesByListId,
  }
})
