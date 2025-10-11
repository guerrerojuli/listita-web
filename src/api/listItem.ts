import { Api } from './client'
import type { PaginatedResponse } from './category'
import type { Product } from './product'

class ListItemApi {
  static getUrl(listId: number, itemId?: number): string {
    return `/api/shopping-lists/${listId}/items${itemId ? `/${itemId}` : ''}`
  }

  static async add(
    listId: number,
    productId: number,
    quantity: number = 1,
    unit: string = 'unit',
    controller?: AbortController,
  ): Promise<ListItem | { item: ListItem }> {
    return await Api.post<ListItem | { item: ListItem }>(
      ListItemApi.getUrl(listId),
      true,
      { product: { id: productId }, quantity, unit },
      undefined,
      controller,
    )
  }

  static async modify(
    listId: number,
    item: ListItem,
    controller?: AbortController,
  ): Promise<ListItem> {
    return await Api.put<ListItem>(
      ListItemApi.getUrl(listId, item.id),
      true,
      { quantity: item.quantity, unit: item.unit },
      controller,
    )
  }

  static async remove(listId: number, itemId: number, controller?: AbortController): Promise<void> {
    return await Api.delete<void>(ListItemApi.getUrl(listId, itemId), true, controller)
  }

  static async get(
    listId: number,
    itemId: number,
    controller?: AbortController,
  ): Promise<ListItem> {
    return await Api.get<ListItem>(ListItemApi.getUrl(listId, itemId), true, undefined, controller)
  }

  static async getAll(
    listId: number,
    controller?: AbortController,
    options: {
      page?: number
      per_page?: number
      sort_by?: string
      order?: 'ASC' | 'DESC'
      purchased?: boolean
    } = {},
  ): Promise<PaginatedResponse<ListItem>> {
    const queryParams: Record<string, unknown> = {}
    if (options.page !== undefined) queryParams.page = options.page
    if (options.per_page !== undefined) queryParams.per_page = options.per_page
    if (options.sort_by !== undefined) queryParams.sort_by = options.sort_by
    if (options.order !== undefined) queryParams.order = options.order
    if (options.purchased !== undefined) queryParams.purchased = options.purchased

    return await Api.get<PaginatedResponse<ListItem>>(
      ListItemApi.getUrl(listId),
      true,
      queryParams,
      controller,
    )
  }

  static async setPurchased(
    listId: number,
    itemId: number,
    purchased: boolean,
    controller?: AbortController,
  ): Promise<ListItem> {
    return await Api.patch<ListItem>(
      ListItemApi.getUrl(listId, itemId),
      true,
      { purchased },
      controller,
    )
  }

  static async updateQuantity(
    listId: number,
    itemId: number,
    quantity: number,
    unit?: string,
    controller?: AbortController,
  ): Promise<ListItem> {
    return await Api.put<ListItem>(
      ListItemApi.getUrl(listId, itemId),
      true,
      { quantity, ...(unit ? { unit } : {}) },
      controller,
    )
  }
}

class ListItem {
  id?: number
  quantity: number
  unit: string
  metadata?: Record<string, unknown> | null
  purchased: boolean
  lastPurchasedAt?: string | null
  createdAt?: string
  updatedAt?: string
  product: Product

  constructor(
    quantity: number,
    unit: string,
    product: Product,
    id?: number,
    purchased: boolean = false,
    metadata?: Record<string, unknown> | null,
    lastPurchasedAt?: string | null,
    createdAt?: string,
    updatedAt?: string,
  ) {
    if (id) {
      this.id = id
    }
    this.quantity = quantity
    this.unit = unit
    this.product = product
    this.purchased = purchased
    this.metadata = metadata
    this.lastPurchasedAt = lastPurchasedAt
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  toString(): string {
    return JSON.stringify(this, null, 2)
  }
}

export { ListItemApi, ListItem }
