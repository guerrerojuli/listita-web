import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiFetch } from '@/api/client'
import type { User } from '@/types/api'

interface Credentials {
  email: string
  password: string
}

interface AuthenticationToken {
  token: string
}

interface RegistrationData {
  email: string
  name: string
  surname: string
  password: string
  metadata?: Record<string, unknown>
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => !!token.value)

  function setToken(newToken: string | null) {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('auth_token', newToken)
    } else {
      localStorage.removeItem('auth_token')
      user.value = null
    }
  }

  async function register(data: RegistrationData) {
    const newUser = await apiFetch<User>('/api/users/register', {
      method: 'POST',
      json: data,
    })
    // After registration, send verification email
    try {
      await sendVerification(data.email)
    } catch (err) {
      console.warn('Failed to send verification email:', err)
    }
    return newUser
  }

  async function login(credentials: Credentials) {
    const res = await apiFetch<AuthenticationToken>('/api/users/login', {
      method: 'POST',
      json: credentials,
    })
    setToken(res.token)
    // Load user profile after login
    await fetchProfile()
  }

  async function logout() {
    try {
      await apiFetch('/api/users/logout', { method: 'POST' })
    } catch {
      // ignore network/logout errors; still clear token
    }
    setToken(null)
  }

  async function fetchProfile() {
    if (!token.value) return
    try {
      user.value = await apiFetch<User>('/api/users/profile', { method: 'GET' })
    } catch (err) {
      console.error('Failed to fetch profile:', err)
    }
  }

  async function updateProfile(updates: { name?: string; surname?: string; metadata?: Record<string, unknown> }) {
    const updated = await apiFetch<User>('/api/users/profile', {
      method: 'PUT',
      json: updates,
    })
    user.value = updated
    return updated
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    await apiFetch('/api/users/change-password', {
      method: 'POST',
      json: { currentPassword, newPassword },
    })
  }

  async function forgotPassword(email: string) {
    await apiFetch('/api/users/forgot-password', {
      method: 'POST',
      query: { email },
    })
  }

  async function sendVerification(email: string) {
    await apiFetch('/api/users/send-verification', {
      method: 'POST',
      query: { email },
    })
  }

  async function verifyAccount(code: string) {
    const verified = await apiFetch<User>('/api/users/verify-account', {
      method: 'POST',
      json: { code },
    })
    return verified
  }

  async function resetPassword(code: string, password: string) {
    await apiFetch('/api/users/reset-password', {
      method: 'POST',
      json: { code, password },
    })
  }

  return {
    token,
    user,
    isAuthenticated,
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



