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
    // Go to verify page so user can enter the code
    router.push({ name: 'verify', query: { email: email.value.trim() } })
  } catch (err: any) {
    errorMessage.value = err?.body?.message || 'Registration failed. Email may already be in use.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthScaffold title="Create an account" :error="errorMessage" :success="successMessage">
    <v-form class="stack" @submit.prevent="handleSubmit">
      <v-text-field v-model="email" label="" placeholder="email@domain.com" type="email" variant="outlined" density="comfortable" class="tall-input" required />
      <v-text-field v-model="name" label="" placeholder="Enter your name" variant="outlined" density="comfortable" class="tall-input" required />
      <v-text-field v-model="surname" label="" placeholder="Enter your surname" variant="outlined" density="comfortable" class="tall-input" required />
      <v-text-field v-model="password" label="" placeholder="Create your password" type="password" variant="outlined" density="comfortable" class="tall-input" required />
      <v-text-field v-model="confirmPassword" label="" placeholder="Repeat your password" type="password" variant="outlined" density="comfortable" class="tall-input" required />

      <v-btn color="black" density="comfortable" :loading="loading" type="submit" block class="cta no-transform" :height="44">
        Create account
      </v-btn>

      <div class="legal">By clicking continue, you agree to our <a href="#" class="link">Terms of Service</a> and <a href="#" class="link">Privacy Policy</a></div>

      <div class="links">
        <div class="links-row">
          <span class="muted">Already have an account? </span>
          <RouterLink to="/login" class="link">Sign in</RouterLink>
        </div>
      </div>
    </v-form>
  </AuthScaffold>
</template>

<script lang="ts">
import AuthScaffold from '@/components/AuthScaffold.vue'
export default { components: { AuthScaffold } }
</script>

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
  margin-bottom: 24px;
}

.logo {
  width: 196px;
  height: 196px;
}

.title { font-weight: 600; margin-bottom: 24px; }

.stack > * { margin-bottom: 16px; }
.block-gap { margin-bottom: 16px; }
.tall-input { --v-input-control-height: 44px; }
.cta { margin-bottom: 12px; font-size: 16px; }

.links { text-align: center; font-size: 12px; }
.link { color: #111827; text-decoration: underline; }
.link-btn { text-transform: none; text-decoration: underline; color: #6b7280; }

.legal { color: #6b7280; font-size: 12px; margin-bottom: 12px; }
.muted { color: #6b7280; }
.no-transform { text-transform: none; }
</style>

