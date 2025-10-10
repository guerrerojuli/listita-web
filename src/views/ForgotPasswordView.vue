<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!email.value.trim()) {
    errorMessage.value = 'Please enter your email address'
    return
  }

  loading.value = true
  try {
    await auth.forgotPassword(email.value.trim())
    // Store email temporarily so we can reference it later if needed
    localStorage.setItem('pending_password_reset_email', email.value.trim())
    successMessage.value = 'Recovery code sent to your email'
    // Give user time to see success message before navigating
    setTimeout(() => router.push({ name: 'reset-password' }), 1500)
  } catch (err: any) {
    errorMessage.value = 'Failed to send recovery email. Please check your email address.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthScaffold title="Forgot Password" :error="errorMessage" :success="successMessage">
    <v-form class="stack" @submit.prevent="handleSubmit">
      <v-text-field
        v-model="email"
        label=""
        placeholder="email@domain.com"
        type="email"
        variant="outlined"
        density="comfortable"
        class="tall-input"
        required
      />

      <v-btn color="black" density="comfortable" :loading="loading" type="submit" block class="cta no-transform" :height="44">
        Send Email
      </v-btn>

      <div class="links">
        <div class="links-row">
          <RouterLink to="/login" class="link">Back to login</RouterLink>
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
.stack > * { margin-bottom: 16px; }
.tall-input { --v-input-control-height: 44px; }
.cta { margin-bottom: 12px; font-size: 16px; }
.links { text-align: center; font-size: 12px; }
.link { color: #111827; text-decoration: underline; }
.no-transform { text-transform: none; }
</style>
