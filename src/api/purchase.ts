import { Api } from './client'
import type { PaginatedResponse } from './category'
import type { ShoppingList } from './shoppingList'
import type { ListItem } from './listItem'

interface User {
  id: number
  email: string
  name: string
  surname: string
}

class PurchaseApi {
  static getUrl(slug?: string | number): string {
    return `/api/purchases${slug ? `/${slug}` : ''}`
  }

  static async get(id: number, controller?: AbortController): Promise<Purchase> {
    return await Api.get<Purchase>(PurchaseApi.getUrl(id), true, undefined, controller)
  }

  static async getAll(
    controller?: AbortController,
    options: {
      list_id?: number
      page?: number
      per_page?: number
      sort_by?: 'createdAt' | 'list' | 'id'
      order?: 'ASC' | 'DESC'
    } = {},
  ): Promise<PaginatedResponse<Purchase>> {
    const queryParams: Record<string, unknown> = {}
    if (options.list_id !== undefined) queryParams.list_id = options.list_id
    if (options.page !== undefined) queryParams.page = options.page
    if (options.per_page !== undefined) queryParams.per_page = options.per_page
    if (options.sort_by !== undefined) queryParams.sort_by = options.sort_by
    if (options.order !== undefined) queryParams.order = options.order

    return await Api.get<PaginatedResponse<Purchase>>(
      PurchaseApi.getUrl(),
      true,
      queryParams,
      controller,
    )
  }

  static async restore(id: number, controller?: AbortController): Promise<ShoppingList> {
    return await Api.post<ShoppingList>(
      PurchaseApi.getUrl(`${id}/restore`),
      true,
      undefined,
      undefined,
      controller,
    )
  }
}

class Purchase {
  id: number
  metadata?: Record<string, unknown> | null
  owner: User
  list: ShoppingList
  listItemArray: ListItem[]
  createdAt?: string

  constructor(
    id: number,
    owner: User,
    list: ShoppingList,
    listItemArray: ListItem[],
    metadata?: Record<string, unknown> | null,
    createdAt?: string,
  ) {
    this.id = id
    this.owner = owner
    this.list = list
    this.listItemArray = listItemArray
    this.metadata = metadata
    this.createdAt = createdAt
  }

  toString(): string {
    return JSON.stringify(this, null, 2)
  }
}

export { PurchaseApi, Purchase }
