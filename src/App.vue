<script setup lang="ts">
import { RouterView } from 'vue-router'
import NotificationContainer from '@/components/NotificationContainer.vue'
</script>

<template>
  <v-app class="app-container">
    <v-main>
      <RouterView />
    </v-main>
    <NotificationContainer />
  </v-app>
</template>

<style>
.app-container {
  background-color: #fafafa !important;
}
</style>
