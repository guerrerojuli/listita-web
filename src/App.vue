<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <v-app>
    <NavBar v-if="!route.meta.hideNavBar" />
    <v-main>
      <RouterView />
    </v-main>
  </v-app>
</template>
