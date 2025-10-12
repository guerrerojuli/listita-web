import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ListItemApi } from '@/api/listItem'
import type { ListItem as ListItemType } from '@/types/api'

interface ListItemWithListId extends ListItemType {
  listId: number
}

export const useProductsStore = defineStore('products', () => {
  const items = ref<ListItemWithListId[]>([])
  const currentListId = ref<number | null>(null)
  const currentPage = ref(1)
  const hasMore = ref(true)
  const loadingMore = ref(false)

  function getItemsByListId(listId: number): ListItemWithListId[] {
    return items.value.filter((i) => i.listId === listId)
  }

  function mapListItem(data: unknown, listId: number): ListItemWithListId {
    return { ...(data as ListItemType), listId }
  }

  async function loadListItems(listId: number, params?: Record<string, unknown>) {
    currentListId.value = listId
    currentPage.value = 1
    hasMore.value = true

    const result = await ListItemApi.getAll(listId, undefined, { ...params, page: 1, per_page: 10 })
    items.value = result.data.map((item) => mapListItem(item, listId))
    hasMore.value = result.pagination?.has_next ?? false
  }

  async function loadMoreListItems(listId: number, params?: Record<string, unknown>) {
    if (loadingMore.value || !hasMore.value || currentListId.value !== listId) return

    loadingMore.value = true

    try {
      currentPage.value += 1
      const result = await ListItemApi.getAll(listId, undefined, {
        ...params,
        page: currentPage.value,
        per_page: 10,
      })
      const newItems = result.data.map((item) => mapListItem(item, listId))
      items.value = [...items.value, ...newItems]
      hasMore.value = result.pagination?.has_next ?? false
    } catch (err: any) {
      console.error('Failed to load more list items:', err)
      currentPage.value -= 1
    } finally {
      loadingMore.value = false
    }
  }

  async function addItem(listId: number, productId: number, quantity = 1, unit = 'unit') {
    const response = await ListItemApi.add(listId, productId, quantity, unit)
    const created = (response as { item?: unknown }).item || response
    items.value.unshift(mapListItem(created, listId))
  }

  async function deleteItem(listId: number, itemId: number) {
    await ListItemApi.remove(listId, itemId)
    const index = items.value.findIndex((i) => i.id === itemId)
    if (index !== -1) items.value.splice(index, 1)
  }

  async function setPurchased(listId: number, itemId: number, purchased: boolean) {
    const result = await ListItemApi.setPurchased(listId, itemId, purchased)
    const updated = mapListItem(result, listId)
    const idx = items.value.findIndex((i) => i.id === itemId)
    if (idx !== -1) items.value[idx] = updated
  }

  async function updateQuantity(listId: number, itemId: number, quantity: number, unit?: string) {
    const result = await ListItemApi.updateQuantity(listId, itemId, quantity, unit)
    const updated = mapListItem(result, listId)
    const idx = items.value.findIndex((i) => i.id === itemId)
    if (idx !== -1) items.value[idx] = updated
  }

  function incrementQuantity(listId: number, itemId: number) {
    const item = items.value.find((i) => i.id === itemId)
    if (item && !item.purchased) updateQuantity(listId, itemId, item.quantity + 1, item.unit)
  }

  function decrementQuantity(listId: number, itemId: number) {
    const item = items.value.find((i) => i.id === itemId)
    if (item && !item.purchased && item.quantity > 1)
      updateQuantity(listId, itemId, item.quantity - 1, item.unit)
  }

  return {
    items,
    currentListId,
    currentPage,
    hasMore,
    loadingMore,
    loadListItems,
    loadMoreListItems,
    getItemsByListId,
    addItem,
    deleteItem,
    setPurchased,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
  }
})
