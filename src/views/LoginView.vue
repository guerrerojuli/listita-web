<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

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
</script>

<template>
  <div class="login-view">
    <v-container class="py-12" style="max-width: 480px">
      <h1 class="mb-6">Sign in</h1>
      <v-alert v-if="errorMessage" type="error" class="mb-4" density="comfortable">
        {{ errorMessage }}
      </v-alert>
      <v-form @submit.prevent="handleSubmit">
        <v-text-field v-model="email" label="Email" type="email" variant="outlined" class="mb-4" required />
        <v-text-field v-model="password" label="Password" type="password" variant="outlined" class="mb-6" required />
        <v-btn color="black" density="comfortable" :loading="loading" type="submit" block>Sign in</v-btn>
      </v-form>
    </v-container>
  </div>
  
</template>

<style scoped>
.login-view {
  background-color: #fafafa;
  min-height: calc(100vh - 72px);
}
</style>


