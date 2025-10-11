import { Api } from './client'
import type { PaginatedResponse } from './category'

interface User {
  id: number
  email: string
  name: string
  surname: string
}

class ShoppingListApi {
  static getUrl(slug?: string | number, query?: string): string {
    return `/api/shopping-lists${slug ? `/${slug}` : ''}${query ? `?${query}` : ''}`
  }

  static async add(
    shoppingList: ShoppingList,
    controller?: AbortController,
  ): Promise<ShoppingList> {
    return await Api.post<ShoppingList>(
      ShoppingListApi.getUrl(),
      true,
      shoppingList,
      undefined,
      controller,
    )
  }

  static async modify(
    shoppingList: ShoppingList,
    controller?: AbortController,
  ): Promise<ShoppingList> {
    return await Api.put<ShoppingList>(
      ShoppingListApi.getUrl(shoppingList.id),
      true,
      shoppingList,
      controller,
    )
  }

  static async remove(id: number, controller?: AbortController): Promise<void> {
    return await Api.delete<void>(ShoppingListApi.getUrl(id), true, controller)
  }

  static async get(id: number, controller?: AbortController): Promise<ShoppingList> {
    return await Api.get<ShoppingList>(ShoppingListApi.getUrl(id), true, undefined, controller)
  }

  static async getAll(
    controller?: AbortController,
    options: {
      page?: number
      per_page?: number
      sort_by?: string
      order?: 'ASC' | 'DESC'
      name?: string
      owner?: boolean
      recurring?: boolean
    } = {},
  ): Promise<PaginatedResponse<ShoppingList>> {
    const queryParams: Record<string, unknown> = {}
    if (options.page !== undefined) queryParams.page = options.page
    if (options.per_page !== undefined) queryParams.per_page = options.per_page
    if (options.sort_by !== undefined) queryParams.sort_by = options.sort_by
    if (options.order !== undefined) queryParams.order = options.order
    if (options.name !== undefined) queryParams.name = options.name
    if (options.owner !== undefined) queryParams.owner = options.owner
    if (options.recurring !== undefined) queryParams.recurring = options.recurring

    return await Api.get<PaginatedResponse<ShoppingList>>(
      ShoppingListApi.getUrl(),
      true,
      queryParams,
      controller,
    )
  }

  static async purchase(id: number, controller?: AbortController): Promise<void> {
    return await Api.post<void>(
      ShoppingListApi.getUrl(`${id}/purchase`),
      true,
      undefined,
      undefined,
      controller,
    )
  }

  static async reset(id: number, controller?: AbortController): Promise<void> {
    return await Api.post<void>(
      ShoppingListApi.getUrl(`${id}/reset`),
      true,
      undefined,
      undefined,
      controller,
    )
  }

  static async moveToPantry(
    id: number,
    pantryId: number,
    controller?: AbortController,
  ): Promise<void> {
    return await Api.post<void>(
      ShoppingListApi.getUrl(`${id}/move-to-pantry`),
      true,
      { pantry_id: pantryId },
      undefined,
      controller,
    )
  }

  static async share(id: number, email: string, controller?: AbortController): Promise<void> {
    return await Api.post<void>(
      ShoppingListApi.getUrl(`${id}/share`),
      true,
      { email },
      undefined,
      controller,
    )
  }

  static async getSharedUsers(id: number, controller?: AbortController): Promise<User[]> {
    return await Api.get<User[]>(
      ShoppingListApi.getUrl(`${id}/shared-users`),
      true,
      undefined,
      controller,
    )
  }

  static async revokeAccess(
    listId: number,
    userId: number,
    controller?: AbortController,
  ): Promise<void> {
    return await Api.delete<void>(
      ShoppingListApi.getUrl(`${listId}/share/${userId}`),
      true,
      controller,
    )
  }
}

class ShoppingList {
  id?: number
  name: string
  description?: string
  recurring: boolean
  metadata?: Record<string, unknown>
  owner?: User
  sharedWith?: User[]
  lastPurchasedAt?: string | null
  createdAt?: string
  updatedAt?: string

  constructor(
    name: string,
    recurring: boolean = false,
    id?: number,
    description?: string,
    metadata?: Record<string, unknown>,
    owner?: User,
    sharedWith?: User[],
    lastPurchasedAt?: string | null,
    createdAt?: string,
    updatedAt?: string,
  ) {
    if (id) {
      this.id = id
    }
    this.name = name
    this.description = description
    this.recurring = recurring
    this.metadata = metadata || {}
    this.owner = owner
    this.sharedWith = sharedWith || []
    this.lastPurchasedAt = lastPurchasedAt
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  toString(): string {
    return JSON.stringify(this, null, 2)
  }
}

export { ShoppingListApi, ShoppingList }
