import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ShoppingListApi, ShoppingList } from '@/api/shoppingList'
import type { ShoppingList as ShoppingListType } from '@/types/api'

export const useListsStore = defineStore('lists', () => {
  const lists = ref<ShoppingListType[]>([])
  const searchQuery = ref('')
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const hasMore = ref(true)
  const loadingMore = ref(false)

  const recurrentLists = computed(() =>
    lists.value.filter((list) => list.recurring && matchesSearch(list)),
  )

  const activeLists = computed(() =>
    lists.value.filter((list) => !list.recurring && matchesSearch(list)),
  )

  function matchesSearch(list: ShoppingListType): boolean {
    if (!searchQuery.value) return true
    return list.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  }

  function mapShoppingList(data: ShoppingListType): ShoppingListType {
    return data
  }

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

  async function fetchLists(params?: { name?: string; owner?: boolean; recurring?: boolean }) {
    loading.value = true
    error.value = null
    currentPage.value = 1
    hasMore.value = true

    try {
      const result = await ShoppingListApi.getAll(undefined, { ...params, page: 1, per_page: 10 })
      lists.value = result.data.map((list) => mapShoppingList(list as unknown as ShoppingListType))
      hasMore.value = result.pagination?.has_next ?? false
    } catch (err: any) {
      error.value = getErrorMessage(err)
      lists.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  async function loadMoreLists(params?: { name?: string; owner?: boolean; recurring?: boolean }) {
    if (loadingMore.value || !hasMore.value) return

    loadingMore.value = true

    try {
      currentPage.value += 1
      const result = await ShoppingListApi.getAll(undefined, {
        ...params,
        page: currentPage.value,
        per_page: 10,
      })
      const newLists = result.data.map((list) =>
        mapShoppingList(list as unknown as ShoppingListType),
      )

      lists.value = [...lists.value, ...newLists]
      hasMore.value = result.pagination?.has_next ?? false
    } catch (err: any) {
      console.error('Failed to load more lists:', err)
      currentPage.value -= 1
    } finally {
      loadingMore.value = false
    }
  }

  async function createList(name: string, description: string = '', recurring: boolean = false) {
    const shoppingList = new ShoppingList(name, recurring, undefined, description, {})
    await ShoppingListApi.add(shoppingList)
    await fetchLists()
  }

  async function deleteList(id: number) {
    await ShoppingListApi.remove(id)
    await fetchLists()
  }

  async function getListById(id: number) {
    const result = await ShoppingListApi.get(id)
    return mapShoppingList(result as unknown as ShoppingListType)
  }

  async function updateList(
    id: number,
    updates: {
      name?: string
      description?: string
      recurring?: boolean
      metadata?: Record<string, unknown>
    },
  ) {
    const list = await ShoppingListApi.get(id)
    const updatedList = Object.assign(list, updates)
    const result = await ShoppingListApi.modify(updatedList)
    const updated = mapShoppingList(result as unknown as ShoppingListType)
    const index = lists.value.findIndex((list) => list.id === id)
    if (index !== -1) lists.value[index] = updated
    return updated
  }

  async function purchaseList(id: number) {
    await ShoppingListApi.purchase(id)
    await fetchLists()
  }

  async function resetListItems(id: number) {
    await ShoppingListApi.reset(id)
  }

  async function moveToPantry(id: number, pantryId: number) {
    await ShoppingListApi.moveToPantry(id, pantryId)
  }

  async function shareList(id: number, email: string) {
    await ShoppingListApi.share(id, email)
  }

  async function getSharedUsers(id: number) {
    return await ShoppingListApi.getSharedUsers(id)
  }

  async function revokeAccess(listId: number, userId: number) {
    await ShoppingListApi.revokeAccess(listId, userId)
  }

  function updateSearch(query: string) {
    searchQuery.value = query
  }

  return {
    lists,
    searchQuery,
    loading,
    error,
    currentPage,
    hasMore,
    loadingMore,
    recurrentLists,
    activeLists,
    fetchLists,
    loadMoreLists,
    createList,
    deleteList,
    getListById,
    updateList,
    purchaseList,
    resetListItems,
    moveToPantry,
    shareList,
    getSharedUsers,
    revokeAccess,
    updateSearch,
  }
})
