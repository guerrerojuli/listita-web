<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const code = ref<string>((route.query.code as string) || '')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Get the email from localStorage (saved when requesting the reset)
const savedEmail = localStorage.getItem('pending_password_reset_email') || ''

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''

  // Validate all fields
  if (!code.value || code.value.trim().length === 0) {
    errorMessage.value = 'Please enter the verification code'
    return
  }

  if (!password.value) {
    errorMessage.value = 'Please enter your new password'
    return
  }

  if (password.value.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match'
    return
  }

  loading.value = true
  try {
    await auth.resetPassword(code.value.trim(), password.value)
    // Clean up the stored email
    localStorage.removeItem('pending_password_reset_email')
    successMessage.value = 'Password reset successfully. You can now log in.'
    // Redirect to login after showing success message
    setTimeout(() => router.push({ name: 'login' }), 1500)
  } catch (err: any) {
    errorMessage.value = err?.body?.message || 'Invalid or expired code. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthScaffold title="Reset Password" :error="errorMessage" :success="successMessage">
    <v-form class="stack" @submit.prevent="handleSubmit">
      <v-text-field
        v-model="code"
        label=""
        placeholder="Verification code"
        variant="outlined"
        density="comfortable"
        class="tall-input"
        autocomplete="off"
        required
      />
      <v-text-field
        v-model="password"
        label=""
        placeholder="Enter your new password"
        type="password"
        variant="outlined"
        density="comfortable"
        class="tall-input"
        autocomplete="new-password"
        required
      />
      <v-text-field
        v-model="confirmPassword"
        label=""
        placeholder="Repeat your new password"
        type="password"
        variant="outlined"
        density="comfortable"
        class="tall-input"
        autocomplete="new-password"
        required
      />

      <v-btn color="black" density="comfortable" :loading="loading" type="submit" block class="cta no-transform" :height="44">
        Reset Password
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
