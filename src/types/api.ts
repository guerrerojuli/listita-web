export interface User {
  id: number
  email: string
  name: string
  surname: string
  metadata?: Record<string, unknown>
  createdAt?: string
  updatedAt?: string
}

export interface Category {
  id: number
  name: string
  metadata?: Record<string, unknown>
  createdAt?: string
  updatedAt?: string
}

export interface Pantry {
  id: number
  name: string
  metadata?: Record<string, unknown> | null
  createdAt?: string
  updatedAt?: string
  owner: User
  sharedWith?: User[] | null
}

export interface Product {
  id: number
  name: string
  metadata?: Record<string, unknown>
  createdAt?: string
  updatedAt?: string
  category: Category
  pantry: Pantry | null
}

export interface ShoppingList {
  id: number
  name: string
  description?: string
  recurring: boolean
  metadata?: Record<string, unknown>
  owner: User
  sharedWith: User[]
  lastPurchasedAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface ListItem {
  id: number
  quantity: number
  unit: string
  metadata?: Record<string, unknown> | null
  purchased: boolean
  lastPurchasedAt?: string | null
  createdAt?: string
  updatedAt?: string
  product: Product
}

export interface Purchase {
  id: number
  metadata?: Record<string, unknown> | null
  owner?: User
  list: ShoppingList
  items: ListItem[]
  createdAt?: string
  updatedAt?: string
}
