<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const name = ref('')
const surname = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''
  
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match'
    return
  }
  
  if (password.value.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters'
    return
  }
  
  loading.value = true
  try {
    await auth.register({
      name: name.value.trim(),
      surname: surname.value.trim(),
      email: email.value.trim(),
      password: password.value,
      metadata: {},
    })
    successMessage.value = 'Registration successful! A verification email has been sent. Please check your inbox.'
    // Clear form
    name.value = ''
    surname.value = ''
    email.value = ''
    password.value = ''
    confirmPassword.value = ''
    // Redirect to login after 3 seconds
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  } catch (err: any) {
    errorMessage.value = err?.body?.message || 'Registration failed. Email may already be in use.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="register-view">
    <v-container class="py-12" style="max-width: 480px">
      <h1 class="mb-6">Create account</h1>
      <v-alert v-if="errorMessage" type="error" class="mb-4" density="comfortable">
        {{ errorMessage }}
      </v-alert>
      <v-alert v-if="successMessage" type="success" class="mb-4" density="comfortable">
        {{ successMessage }}
      </v-alert>
      <v-form @submit.prevent="handleSubmit">
        <v-text-field v-model="name" label="First Name" variant="outlined" class="mb-4" required />
        <v-text-field v-model="surname" label="Last Name" variant="outlined" class="mb-4" required />
        <v-text-field v-model="email" label="Email" type="email" variant="outlined" class="mb-4" required />
        <v-text-field 
          v-model="password" 
          label="Password" 
          type="password" 
          variant="outlined" 
          class="mb-4" 
          hint="Minimum 6 characters"
          required 
        />
        <v-text-field 
          v-model="confirmPassword" 
          label="Confirm Password" 
          type="password" 
          variant="outlined" 
          class="mb-4" 
          required 
        />
        <v-btn color="black" density="comfortable" :loading="loading" type="submit" block class="mb-4">
          Create account
        </v-btn>
        <div class="text-center">
          <v-btn variant="text" size="small" to="/login">
            Already have an account? Sign in
          </v-btn>
        </div>
      </v-form>
    </v-container>
  </div>
</template>

<style scoped>
.register-view {
  background-color: #fafafa;
  min-height: calc(100vh - 72px);
}
</style>

