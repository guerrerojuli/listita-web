<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''
  loading.value = true
  try {
    await auth.login({ email: email.value.trim(), password: password.value })
    router.replace('/')
  } catch (err: any) {
    errorMessage.value = 'Invalid credentials or server error'
  } finally {
    loading.value = false
  }
}

async function handleForgotPassword() {
  if (!email.value.trim()) {
    errorMessage.value = 'Please enter your email address'
    return
  }
  
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true
  
  try {
    await auth.forgotPassword(email.value.trim())
    successMessage.value = 'Password reset instructions sent to your email'
  } catch (err: any) {
    errorMessage.value = 'Failed to send reset email. Please check your email address.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-layout">
    <v-container class="auth-card">
      <div class="logo-wrap">
        <img src="/logo.svg" alt="Listita" class="logo" />
      </div>
      <h2 class="title">Welcome Back</h2>
      <div class="subtitle">Login to access the platform</div>

      <v-alert v-if="errorMessage" type="error" class="block-gap" density="comfortable">
        {{ errorMessage }}
      </v-alert>
      <v-alert v-if="successMessage" type="success" class="block-gap" density="comfortable">
        {{ successMessage }}
      </v-alert>

      <v-form class="stack" @submit.prevent="handleSubmit">
        <v-text-field
          v-model="email"
          label=""
          placeholder="email@domain.com"
          type="email"
          variant="outlined"
          density="comfortable"
          class="tall-input"
          style="--v-input-control-height: 44px"
          required
        />
        <v-text-field
          v-model="password"
          label=""
          placeholder="Enter your password"
          type="password"
          variant="outlined"
          density="comfortable"
          class="tall-input"
          style="--v-input-control-height: 44px"
          required
        />

        <v-btn color="black" density="comfortable" :loading="loading" type="submit" block class="cta no-transform" :height="44">
          Login
        </v-btn>

        <div class="links">
          <div class="links-row">
            <span class="muted">Don't have an account? </span>
            <RouterLink to="/register" class="link">Sign up</RouterLink>
          </div>
          <button type="button" class="link as-text" @click="handleForgotPassword" :disabled="loading">
            Forgot password?
          </button>
        </div>
      </v-form>
    </v-container>
  </div>
  
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
}

.auth-card {
  width: 100%;
  max-width: 360px;
  text-align: center;
  padding: 40px 0;
}

.logo-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.logo {
  width: 196px;
  height: 196px;
}

.brand {
  font-weight: 600;
}

.title { font-weight: 600; margin-bottom: 4px; }

.subtitle { color: #6b7280; font-size: 0.95rem; margin-bottom: 24px; }

.stack > * { margin-bottom: 16px; }
.block-gap { margin-bottom: 16px; }
.tall-input { --v-input-control-height: 44px; }
.cta { margin-bottom: 12px; font-size: 16px; }

.links { text-align: center; font-size: 12px; }
.links .link { color: #111827; text-decoration: underline; }

.links .as-text {
  background: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
  color: #6b7280;
  text-decoration: underline;
}
.no-transform { text-transform: none; }
.muted { color: #6b7280; }
.links { text-align: center; }
.links-row { margin-bottom: 8px; }
</style>