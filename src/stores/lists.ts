import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ShoppingListApi, ShoppingList } from '@/api/shoppingList'
import type { ShoppingList as ShoppingListType } from '@/types/api'

export const useListsStore = defineStore('lists', () => {
  // State
  const lists = ref<ShoppingListType[]>([])
  const searchQuery = ref('')

  // Getters
  const recurrentLists = computed(() =>
    lists.value.filter((list) => list.recurring && matchesSearch(list)),
  )

  const activeLists = computed(() =>
    lists.value.filter((list) => !list.recurring && matchesSearch(list)),
  )

  // Helper function
  function matchesSearch(list: ShoppingListType): boolean {
    if (!searchQuery.value) return true
    return list.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  }

  function mapShoppingList(data: ShoppingListType): ShoppingListType {
    // Return data as-is from API, no need to instantiate class
    return data
  }

  // Actions
  async function fetchLists(params?: { name?: string; owner?: boolean; recurring?: boolean }) {
    const result = await ShoppingListApi.getAll(undefined, params)
    lists.value = result.data.map((list) => mapShoppingList(list as unknown as ShoppingListType))
  }

  async function createList(name: string, recurring: boolean = false) {
    const shoppingList = new ShoppingList(name, recurring, undefined, '', {})
    const result = await ShoppingListApi.add(shoppingList)
    const created = mapShoppingList(result as unknown as ShoppingListType)
    lists.value.unshift(created)
  }

  async function deleteList(id: number) {
    await ShoppingListApi.remove(id)
    const index = lists.value.findIndex((list) => list.id === id)
    if (index !== -1) lists.value.splice(index, 1)
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
    // Optionally refresh the list after purchase
    await fetchLists()
  }

  async function resetListItems(id: number) {
    await ShoppingListApi.reset(id)
    // Items will need to be refreshed in the products store
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
    // State
    lists,
    searchQuery,
    // Getters
    recurrentLists,
    activeLists,
    // Actions
    fetchLists,
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
