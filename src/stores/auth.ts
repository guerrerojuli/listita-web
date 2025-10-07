import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiFetch } from '@/api/client'

interface Credentials {
  email: string
  password: string
}

interface AuthenticationToken {
  token: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const isAuthenticated = computed(() => !!token.value)

  function setToken(newToken: string | null) {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('auth_token', newToken)
    } else {
      localStorage.removeItem('auth_token')
    }
  }

  async function login(credentials: Credentials) {
    const res = await apiFetch<AuthenticationToken>('/api/users/login', {
      method: 'POST',
      json: credentials,
    })
    setToken(res.token)
  }

  async function logout() {
    try {
      await apiFetch('/api/users/logout', { method: 'POST' })
    } catch {
      // ignore network/logout errors; still clear token
    }
    setToken(null)
  }

  return {
    token,
    isAuthenticated,
    login,
    logout,
  }
})



