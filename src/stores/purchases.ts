import { defineStore } from 'pinia'
import { ref } from 'vue'
import { PurchaseApi } from '@/api/purchase'
import type { Purchase as PurchaseType } from '@/types/api'

export const usePurchasesStore = defineStore('purchases', () => {
  const purchases = ref<PurchaseType[]>([])
  const loading = ref(false)

  function mapPurchase(data: PurchaseType): PurchaseType {
    // Return data as-is from API, no need to instantiate class
    return data
  }

  async function fetchPurchases(params?: {
    list_id?: number
    page?: number
    per_page?: number
    sort_by?: 'createdAt' | 'list' | 'id'
    order?: 'ASC' | 'DESC'
  }) {
    loading.value = true
    try {
      const result = await PurchaseApi.getAll(undefined, params)
      purchases.value = result.data.map((purchase) =>
        mapPurchase(purchase as unknown as PurchaseType),
      )
      return purchases.value
    } finally {
      loading.value = false
    }
  }

  async function getPurchaseById(id: number) {
    const result = await PurchaseApi.get(id)
    return mapPurchase(result as unknown as PurchaseType)
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
    fetchPurchases,
    getPurchaseById,
    restorePurchase,
    getPurchasesByListId,
  }
})
