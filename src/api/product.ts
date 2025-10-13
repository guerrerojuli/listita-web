import { Api } from './client'
import type { Category } from './category'
import type { PaginatedResponse } from './category'

interface Pantry {
  id: number
  name: string
  metadata?: Record<string, unknown> | null
  createdAt?: string
  updatedAt?: string
}

class ProductApi {
  static getUrl(slug?: string | number): string {
    return `/api/products${slug ? `/${slug}` : ''}`
  }

  static async add(product: Product, controller?: AbortController): Promise<Product> {
    return await Api.post<Product>(ProductApi.getUrl(), true, product, undefined, controller)
  }

  static async modify(product: Product, controller?: AbortController): Promise<Product> {
    return await Api.put<Product>(ProductApi.getUrl(product.id), true, product, controller)
  }

  static async remove(id: number, controller?: AbortController): Promise<void> {
    return await Api.delete<void>(ProductApi.getUrl(id), true, controller)
  }

  static async get(id: number, controller?: AbortController): Promise<Product> {
    return await Api.get<Product>(ProductApi.getUrl(id), true, undefined, controller)
  }

  static async getAll(
    controller?: AbortController,
    options: {
      page?: number
      per_page?: number
      sort_by?: string
      order?: 'ASC' | 'DESC'
      name?: string
      category_id?: number
      pantry_id?: number
    } = {},
  ): Promise<PaginatedResponse<Product>> {
    const queryParams: Record<string, unknown> = {}
    if (options.page !== undefined) queryParams.page = options.page
    if (options.per_page !== undefined) queryParams.per_page = options.per_page
    if (options.sort_by !== undefined) queryParams.sort_by = options.sort_by
    if (options.order !== undefined) queryParams.order = options.order
    if (options.name !== undefined) queryParams.name = options.name
    if (options.category_id !== undefined) queryParams.category_id = options.category_id
    if (options.pantry_id !== undefined) queryParams.pantry_id = options.pantry_id

    return await Api.get<PaginatedResponse<Product>>(
      ProductApi.getUrl(),
      true,
      queryParams,
      controller,
    )
  }
}

class Product {
  id?: number
  name: string
  category: { id: number } | Category
  pantry_id?: number | null
  metadata?: Record<string, unknown>
  createdAt?: string
  updatedAt?: string
  pantry?: Pantry | null

  constructor(
    name: string,
    category: { id: number } | Category,
    id?: number,
    pantry_id?: number | null,
    metadata?: Record<string, unknown>,
    createdAt?: string,
    updatedAt?: string,
    pantry?: Pantry | null,
  ) {
    if (id) {
      this.id = id
    }
    this.name = name
    this.category = category
    this.pantry_id = pantry_id
    this.metadata = metadata || {}
    this.createdAt = createdAt
    this.updatedAt = updatedAt
    this.pantry = pantry
  }

  toString(): string {
    return JSON.stringify(this, null, 2)
  }
}

export { ProductApi, Product }
