<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const code = ref<string>((route.query.code as string) || '')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Get the email from localStorage (saved during registration)
const savedEmail = localStorage.getItem('pending_verification_email') || ''

async function handleVerify() {
  errorMessage.value = ''
  successMessage.value = ''
  if (!code.value || code.value.trim().length === 0) {
    errorMessage.value = 'Ingresa el código de verificación'
    return
  }
  loading.value = true
  try {
    await auth.verifyAccount(code.value.trim())
    // Clear the stored email since verification is complete
    localStorage.removeItem('pending_verification_email')
    successMessage.value = 'Cuenta verificada con éxito. Ya puedes iniciar sesión.'
    setTimeout(() => router.push({ name: 'login' }), 1500)
  } catch (err: any) {
    errorMessage.value = err?.body?.message || 'Código inválido o expirado. Intenta nuevamente.'
  } finally {
    loading.value = false
  }
}

async function resendCode() {
  errorMessage.value = ''
  successMessage.value = ''
  if (!savedEmail) {
    errorMessage.value = 'No se encontró el email. Por favor regístrate nuevamente.'
    return
  }
  loading.value = true
  try {
    await auth.sendVerification(savedEmail)
    successMessage.value = 'Te enviamos un nuevo código a tu email.'
  } catch (err: any) {
    errorMessage.value = err?.body?.message || 'No se pudo enviar el código. Intenta más tarde.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthScaffold title="Verificar cuenta" :error="errorMessage" :success="successMessage">
    <v-form class="stack" @submit.prevent="handleVerify">
      <v-text-field v-model="code" label="" placeholder="Código de verificación" variant="outlined" density="comfortable" class="tall-input" required />

      <v-btn color="black" density="comfortable" :loading="loading" type="submit" block class="cta no-transform" :height="44">
        Verificar
      </v-btn>
      <v-btn variant="text" class="link-btn" :disabled="loading" @click="resendCode">Reenviar código</v-btn>

      <div class="links">
        <div class="links-row">
          <RouterLink to="/login" class="link">Iniciar sesión</RouterLink>
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
.link-btn { text-transform: none; text-decoration: underline; color: #6b7280; }
.no-transform { text-transform: none; }
</style>


