import { Api } from './client'

interface PaginatedResponse<T> {
  data: T[]
  pagination?: {
    page: number
    per_page: number
    total: number
    total_pages: number
    has_prev: boolean
    has_next: boolean
  }
}

class CategoryApi {
  static getUrl(slug?: string | number, query?: string): string {
    return `/api/categories${slug ? `/${slug}` : ''}${query ? `?${query}` : ''}`
  }

  static async add(category: Category, controller?: AbortController): Promise<Category> {
    return await Api.post<Category>(CategoryApi.getUrl(), true, category, undefined, controller)
  }

  static async modify(category: Category, controller?: AbortController): Promise<Category> {
    return await Api.put<Category>(CategoryApi.getUrl(category.id), true, category, controller)
  }

  static async remove(id: number, controller?: AbortController): Promise<void> {
    return await Api.delete<void>(CategoryApi.getUrl(id), true, controller)
  }

  static async get(id: number, controller?: AbortController): Promise<Category> {
    return await Api.get<Category>(CategoryApi.getUrl(id), true, undefined, controller)
  }

  static async getAll(
    controller?: AbortController,
    options: {
      page?: number
      per_page?: number
      sort_by?: string
      order?: 'ASC' | 'DESC'
      name?: string
    } = {},
  ): Promise<PaginatedResponse<Category>> {
    const { page = 1, per_page = 10, sort_by = 'createdAt', order = 'DESC', name } = options
    const queryParams: Record<string, unknown> = { page, per_page, sort_by, order }
    if (name) {
      queryParams.name = name
    }
    return await Api.get<PaginatedResponse<Category>>(
      CategoryApi.getUrl(),
      true,
      queryParams,
      controller,
    )
  }

  static async getByName(
    name: string,
    controller?: AbortController,
  ): Promise<PaginatedResponse<Category>> {
    return await Api.get<PaginatedResponse<Category>>(
      CategoryApi.getUrl(),
      true,
      { name },
      controller,
    )
  }
}

class Category {
  id?: number
  name: string
  metadata?: Record<string, unknown>
  createdAt?: string
  updatedAt?: string

  constructor(
    name: string,
    id?: number,
    metadata?: Record<string, unknown>,
    createdAt?: string,
    updatedAt?: string,
  ) {
    if (id) {
      this.id = id
    }
    this.name = name
    this.metadata = metadata || {}
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  toString(): string {
    return JSON.stringify(this, null, 2)
  }
}

export { CategoryApi, Category, type PaginatedResponse }
