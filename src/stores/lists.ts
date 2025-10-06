import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ShoppingList } from '@/types/list'

export const useListsStore = defineStore('lists', () => {
  // State
  const lists = ref<ShoppingList[]>([
    {
      id: '1',
      name: 'Asado en lo de Agu',
      productCount: 8,
      peopleCount: 4,
      isRecurrent: true,
      isShared: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Casa',
      productCount: 10,
      peopleCount: undefined,
      isRecurrent: false,
      isShared: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      name: 'Asado en lo de Jolo',
      productCount: 0,
      peopleCount: undefined,
      isRecurrent: false,
      isShared: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '4',
      name: 'Juntada',
      productCount: 5,
      peopleCount: 6,
      isRecurrent: false,
      isShared: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ])

  const searchQuery = ref('')

  // Getters
  const recurrentLists = computed(() =>
    lists.value.filter((list) => list.isRecurrent && matchesSearch(list)),
  )

  const activeLists = computed(() =>
    lists.value.filter((list) => !list.isRecurrent && matchesSearch(list)),
  )

  // Helper function
  function matchesSearch(list: ShoppingList): boolean {
    if (!searchQuery.value) return true
    return list.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  }

  // Actions
  function createList(name: string, isRecurrent: boolean = false) {
    const newList: ShoppingList = {
      id: Date.now().toString(),
      name,
      productCount: 0,
      isRecurrent,
      isShared: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    lists.value.push(newList)
  }

  function deleteList(id: string) {
    const index = lists.value.findIndex((list) => list.id === id)
    if (index !== -1) {
      lists.value.splice(index, 1)
    }
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
    createList,
    deleteList,
    updateSearch,
  }
})
