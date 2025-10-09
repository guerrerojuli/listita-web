<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  error?: string
  success?: string
}>()

const hasError = computed(() => !!props.error)
const hasSuccess = computed(() => !!props.success)
</script>

<template>
  <div class="auth-layout">
    <v-container class="auth-card">
      <div class="logo-wrap">
        <img src="/logo.svg" alt="Listita" class="logo" />
      </div>
      <h2 class="title">{{ title }}</h2>

      <v-alert v-if="hasError" type="error" class="block-gap" density="comfortable">
        {{ error }}
      </v-alert>
      <v-alert v-if="hasSuccess" type="success" class="block-gap" density="comfortable">
        {{ success }}
      </v-alert>

      <slot />
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


