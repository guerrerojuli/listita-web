import { Api } from './client'

class UserApi {
  static getUrl(slug?: string): string {
    return `/api/users${slug ? `/${slug}` : ''}`
  }

  static async register(data: RegistrationData, controller?: AbortController): Promise<User> {
    return await Api.post<User>(UserApi.getUrl('register'), false, data, undefined, controller)
  }

  static async login(
    credentials: Credentials,
    controller?: AbortController,
  ): Promise<AuthenticationToken> {
    return await Api.post<AuthenticationToken>(
      UserApi.getUrl('login'),
      false,
      credentials,
      undefined,
      controller,
    )
  }

  static async logout(controller?: AbortController): Promise<void> {
    return await Api.post<void>(UserApi.getUrl('logout'), true, undefined, undefined, controller)
  }

  static async getProfile(controller?: AbortController): Promise<User> {
    return await Api.get<User>(UserApi.getUrl('profile'), true, undefined, controller)
  }

  static async updateProfile(updates: Partial<User>, controller?: AbortController): Promise<User> {
    return await Api.put<User>(UserApi.getUrl('profile'), true, updates, controller)
  }

  static async changePassword(
    currentPassword: string,
    newPassword: string,
    controller?: AbortController,
  ): Promise<void> {
    return await Api.post<void>(
      UserApi.getUrl('change-password'),
      true,
      { currentPassword, newPassword },
      undefined,
      controller,
    )
  }

  static async forgotPassword(email: string, controller?: AbortController): Promise<void> {
    return await Api.post<void>(
      UserApi.getUrl('forgot-password'),
      false,
      undefined,
      { email },
      controller,
    )
  }

  static async sendVerification(email: string, controller?: AbortController): Promise<void> {
    return await Api.post<void>(
      UserApi.getUrl('send-verification'),
      false,
      undefined,
      { email },
      controller,
    )
  }

  static async verifyAccount(code: string, controller?: AbortController): Promise<User> {
    return await Api.post<User>(
      UserApi.getUrl('verify-account'),
      false,
      { code },
      undefined,
      controller,
    )
  }

  static async resetPassword(
    code: string,
    password: string,
    controller?: AbortController,
  ): Promise<void> {
    return await Api.post<void>(
      UserApi.getUrl('reset-password'),
      false,
      { code, password },
      undefined,
      controller,
    )
  }
}

class User {
  id?: number
  email: string
  name: string
  surname: string
  metadata?: Record<string, unknown>
  createdAt?: string
  updatedAt?: string

  constructor(
    email: string,
    name: string,
    surname: string,
    id?: number,
    metadata?: Record<string, unknown>,
    createdAt?: string,
    updatedAt?: string,
  ) {
    if (id) {
      this.id = id
    }
    this.email = email
    this.name = name
    this.surname = surname
    this.metadata = metadata || {}
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  toString(): string {
    return JSON.stringify(this, null, 2)
  }
}

class Credentials {
  email: string
  password: string

  constructor(email: string, password: string) {
    this.email = email
    this.password = password
  }
}

class RegistrationData {
  email: string
  name: string
  surname: string
  password: string
  metadata?: Record<string, unknown>

  constructor(
    email: string,
    name: string,
    surname: string,
    password: string,
    metadata?: Record<string, unknown>,
  ) {
    this.email = email
    this.name = name
    this.surname = surname
    this.password = password
    this.metadata = metadata
  }
}

class AuthenticationToken {
  token: string

  constructor(token: string) {
    this.token = token
  }
}

export { UserApi, User, Credentials, RegistrationData, AuthenticationToken }
