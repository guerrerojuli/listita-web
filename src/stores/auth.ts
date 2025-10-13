import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Api } from '@/api/client'
import { UserApi, Credentials, RegistrationData, User } from '@/api/user'

const SECURITY_TOKEN_KEY = 'auth_token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const user = ref<User | null>(null)

  const isAuthenticated = computed(() => {
    return token.value != null
  })

  function initialize() {
    const storedToken = localStorage.getItem(SECURITY_TOKEN_KEY)
    if (storedToken) setToken(storedToken)
  }

  function setToken(value: string | null) {
    token.value = value
    Api.token = value
  }

  function updateToken(value: string, rememberMe: boolean = true) {
    if (rememberMe) localStorage.setItem(SECURITY_TOKEN_KEY, value)
    setToken(value)
  }

  function removeToken() {
    localStorage.removeItem(SECURITY_TOKEN_KEY)
    setToken(null)
  }

  function mapUser(data: User): User {
    if (!data.id) return data
    return Object.assign(new User(data.email, data.name, data.surname), data)
  }

  async function register(data: RegistrationData) {
    const regData = new RegistrationData(
      data.email,
      data.name,
      data.surname,
      data.password,
      data.metadata,
    )
    const result = await UserApi.register(regData) 
    return mapUser(result)
  }

  async function login(credentials: Credentials) {
    const cred = new Credentials(credentials.email, credentials.password)
    const result = await UserApi.login(cred)
    updateToken(result.token, true)
    // Load user profile after login
    await fetchProfile()
  }

  async function logout() {
    try {
      user.value = null
      await UserApi.logout()
    } catch {
      // ignore network/logout errors; still clear token
    } finally {
      removeToken()
    }
  }

  async function fetchProfile() {
    if (!token.value) return
    try {
      const result = await UserApi.getProfile()
      user.value = mapUser(result)
      return user.value
    } catch (err) {
      console.error('Failed to fetch profile:', err)
    }
  }

  async function updateProfile(updates: {
    name?: string
    surname?: string
    metadata?: Record<string, unknown>
  }) {
    const result = await UserApi.updateProfile(updates)
    user.value = mapUser(result)
    return user.value
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    await UserApi.changePassword(currentPassword, newPassword)
  }

  async function forgotPassword(email: string) {
    await UserApi.forgotPassword(email)
  }

  async function sendVerification(email: string) {
    await UserApi.sendVerification(email)
  }

  async function verifyAccount(code: string) {
    const result = await UserApi.verifyAccount(code)
    return mapUser(result)
  }

  async function resetPassword(code: string, password: string) {
    await UserApi.resetPassword(code, password)
  }

  // Initialize token on store creation
  initialize()

  return {
    token,
    user,
    isAuthenticated,
    initialize,
    register,
    login,
    logout,
    fetchProfile,
    updateProfile,
    changePassword,
    forgotPassword,
    sendVerification,
    verifyAccount,
    resetPassword,
  }
})
