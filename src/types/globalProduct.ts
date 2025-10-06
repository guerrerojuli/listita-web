export interface GlobalProduct {
  id: string
  name: string
  price: number
  categories: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
}
