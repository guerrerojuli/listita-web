export interface ShoppingList {
  id: string
  name: string
  productCount: number
  peopleCount?: number
  isRecurrent: boolean
  isShared: boolean
  createdAt: Date
  updatedAt: Date
}

export type ListCategory = 'recurrent' | 'active'
