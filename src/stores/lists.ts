import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiFetch } from '@/api/client'
import type { ShoppingList } from '@/types/api'

export const useListsStore = defineStore('lists', () => {
  // State
  const lists = ref<ShoppingList[]>([])

  const searchQuery = ref('')

  // Getters
  const recurrentLists = computed(() =>
    lists.value.filter((list) => list.recurring && matchesSearch(list)),
  )

  const activeLists = computed(() =>
    lists.value.filter((list) => !list.recurring && matchesSearch(list)),
  )

  // Helper function
  function matchesSearch(list: ShoppingList): boolean {
    if (!searchQuery.value) return true
    return list.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  }

  // Actions
  async function fetchLists(params?: { name?: string; owner?: boolean; recurring?: boolean }) {
    const data = await apiFetch<{ items?: ShoppingList[] } | ShoppingList[]>('/api/shopping-lists', {
      method: 'GET',
      query: params as any,
    })
    // Some APIs wrap in {items: []}; handle either
    const array = Array.isArray(data) ? data : (data.items ?? [])
    lists.value = array
  }

  async function createList(name: string, recurring: boolean = false) {
    const created = await apiFetch<ShoppingList>('/api/shopping-lists', {
      method: 'POST',
      json: { name, description: '', recurring, metadata: {} },
    })
    lists.value.unshift(created)
  }

  async function deleteList(id: number) {
    await apiFetch(`/api/shopping-lists/${id}`, { method: 'DELETE' })
    const index = lists.value.findIndex((list) => list.id === id)
    if (index !== -1) lists.value.splice(index, 1)
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
    updateSearch,
  }
})
