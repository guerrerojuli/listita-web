<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <v-app-bar color="white" elevation="1" height="72">
    <v-container class="navbar-container">
      <RouterLink to="/" class="nav-brand">
        <v-icon size="32">mdi-cart-outline</v-icon>
        <span class="brand-text">Listita</span>
      </RouterLink>

      <div class="nav-center">
        <RouterLink to="/" class="nav-link" active-class="nav-link-active"> Lists </RouterLink>
        <RouterLink to="/products" class="nav-link" active-class="nav-link-active">
          Products
        </RouterLink>
      </div>

      <v-btn icon="mdi-account-circle" variant="text" size="large" />
    </v-container>
  </v-app-bar>
</template>

<style scoped>
.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 2rem;
  position: relative;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #000;
  transition: opacity 0.2s;
}

.nav-brand:hover {
  opacity: 0.7;
}

.brand-text {
  font-size: 1.25rem;
  font-weight: 600;
}

.nav-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: #666;
  font-size: 1rem;
  font-weight: 500;
  transition: color 0.2s;
  padding: 0.5rem 0;
}

.nav-link:hover {
  color: #000;
}

.nav-link-active {
  color: #000;
}
</style>
