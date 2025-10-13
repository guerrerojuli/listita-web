<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useListsStore } from '@/stores/lists'
import { useGlobalProductsStore } from '@/stores/globalProducts'
import BaseDialog from '@/components/BaseDialog.vue'
import BaseInput from '@/components/BaseInput.vue'
import DialogButton from '@/components/DialogButton.vue'

const router = useRouter()
const auth = useAuthStore()
const listsStore = useListsStore()
const productsStore = useGlobalProductsStore()

const hasError = computed(() => listsStore.error || productsStore.error)
const showProfileMenu = ref(false)
const showPasswordDialog = ref(false)
const showProfileDialog = ref(false)

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordError = ref('')
const passwordSuccess = ref('')

const editName = ref('')
const editSurname = ref('')
const profileError = ref('')
const profileSuccess = ref('')

onMounted(() => {
  if (auth.isAuthenticated && !auth.user) {
    auth.fetchProfile()
  }
})

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}

function openProfileDialog() {
  if (auth.user) {
    editName.value = auth.user.name
    editSurname.value = auth.user.surname
  }
  showProfileDialog.value = true
  showProfileMenu.value = false
}

async function handleUpdateProfile() {
  profileError.value = ''
  profileSuccess.value = ''

  try {
    await auth.updateProfile({
      name: editName.value.trim(),
      surname: editSurname.value.trim(),
    })
    profileSuccess.value = 'Profile updated successfully'
    setTimeout(() => {
      showProfileDialog.value = false
      profileSuccess.value = ''
    }, 1500)
  } catch {
    profileError.value = 'Failed to update profile'
  }
}

function openPasswordDialog() {
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  passwordError.value = ''
  passwordSuccess.value = ''
  showPasswordDialog.value = true
  showProfileMenu.value = false
}

async function handleChangePassword() {
  passwordError.value = ''
  passwordSuccess.value = ''

  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'Passwords do not match'
    return
  }

  if (newPassword.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
    return
  }

  try {
    await auth.changePassword(currentPassword.value, newPassword.value)
    passwordSuccess.value = 'Password changed successfully'
    setTimeout(() => {
      showPasswordDialog.value = false
      passwordSuccess.value = ''
    }, 1500)
  } catch {
    passwordError.value = 'Failed to change password. Check your current password.'
  }
}
</script>

<template>
  <v-navigation-drawer permanent class="sidebar" width="280">
    <div class="sidebar-content">
      <div class="sidebar-header">
        <RouterLink to="/" class="nav-brand">
          <v-icon size="32">mdi-cart-outline</v-icon>
          <span class="brand-text">Listita</span>
        </RouterLink>
      </div>

      <nav class="sidebar-nav">
        <RouterLink to="/" class="sidebar-link" active-class="sidebar-link-active">
          <v-icon size="20" class="sidebar-link-icon">mdi-format-list-bulleted</v-icon>
          <span>Lists</span>
        </RouterLink>
        <RouterLink to="/products" class="sidebar-link" active-class="sidebar-link-active">
          <v-icon size="20" class="sidebar-link-icon">mdi-package-variant</v-icon>
          <span>Products</span>
        </RouterLink>
        <RouterLink to="/purchases" class="sidebar-link" active-class="sidebar-link-active">
          <v-icon size="20" class="sidebar-link-icon">mdi-history</v-icon>
          <span>Purchase History</span>
        </RouterLink>
      </nav>

      <div v-if="auth.isAuthenticated && !hasError" class="sidebar-footer">
        <v-menu v-model="showProfileMenu" location="top" :close-on-content-click="false">
          <template v-slot:activator="{ props }">
            <div
              class="user-profile sidebar-link"
              :class="{ 'sidebar-link-active': showProfileMenu }"
              v-bind="props"
            >
              <v-avatar color="grey-lighten-1" size="32">
                <v-icon icon="mdi-account" size="20" />
              </v-avatar>
              <div v-if="auth.user" class="user-info">
                <span class="user-name">{{ auth.user.name }} {{ auth.user.surname }}</span>
              </div>
            </div>
          </template>
          <v-card class="user-menu-card">
            <v-list>
              <v-list-item v-if="auth.user" class="pb-2">
                <v-list-item-title class="font-weight-bold"
                  >{{ auth.user.name }} {{ auth.user.surname }}</v-list-item-title
                >
                <v-list-item-subtitle>{{ auth.user.email }}</v-list-item-subtitle>
              </v-list-item>
              <v-divider />
              <v-list-item @click="openProfileDialog" prepend-icon="mdi-account-edit">
                <v-list-item-title>Edit Profile</v-list-item-title>
              </v-list-item>
              <v-list-item @click="openPasswordDialog" prepend-icon="mdi-lock-reset">
                <v-list-item-title>Change Password</v-list-item-title>
              </v-list-item>
              <v-divider />
              <v-list-item @click="handleLogout" prepend-icon="mdi-logout">
                <v-list-item-title>Logout</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </div>
      <div v-else-if="!auth.isAuthenticated && !hasError" class="sidebar-footer">
        <RouterLink to="/login" class="login-link">
          <v-icon size="20" class="mr-2">mdi-login</v-icon>
          Login
        </RouterLink>
      </div>
    </div>
  </v-navigation-drawer>

  <BaseDialog v-model="showProfileDialog" title="Edit Profile">
    <v-alert v-if="profileError" type="error" class="mb-4" density="comfortable">
      {{ profileError }}
    </v-alert>
    <v-alert v-if="profileSuccess" type="success" class="mb-4" density="comfortable">
      {{ profileSuccess }}
    </v-alert>
    <BaseInput v-model="editName" label="First Name" class="mb-4" />
    <BaseInput v-model="editSurname" label="Last Name" />

    <template #actions="{ close }">
      <DialogButton variant="cancel" @click="close">Cancel</DialogButton>
      <DialogButton variant="primary" @click="handleUpdateProfile">Save</DialogButton>
    </template>
  </BaseDialog>

  <BaseDialog v-model="showPasswordDialog" title="Change Password">
    <v-alert v-if="passwordError" type="error" class="mb-4" density="comfortable">
      {{ passwordError }}
    </v-alert>
    <v-alert v-if="passwordSuccess" type="success" class="mb-4" density="comfortable">
      {{ passwordSuccess }}
    </v-alert>
    <input type="text" autocomplete="username" style="display: none" />
    <BaseInput
      v-model="currentPassword"
      label="Current Password"
      type="password"
      autocomplete="current-password"
      class="mb-4"
    />
    <BaseInput
      v-model="newPassword"
      label="New Password"
      type="password"
      autocomplete="new-password"
      hint="Minimum 6 characters"
      persistent-hint
      class="mb-4"
    />
    <BaseInput
      v-model="confirmPassword"
      label="Confirm New Password"
      type="password"
      autocomplete="new-password"
    />

    <template #actions="{ close }">
      <DialogButton variant="cancel" @click="close">Cancel</DialogButton>
      <DialogButton variant="primary" @click="handleChangePassword">Change Password</DialogButton>
    </template>
  </BaseDialog>
</template>

<style scoped>
.sidebar {
  background-color: white !important;
  border: 1px solid #e0e0e0 !important;
  border-radius: 12px !important;
  margin: 1rem !important;
  height: calc(100vh - 2rem) !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08) !important;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1.5rem 0;
}

.sidebar-header {
  padding: 0 1.5rem 2rem 1.5rem;
  margin-bottom: 0.9rem;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: #000;
  transition: opacity 0.2s;
}

.brand-text {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0 1rem;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  text-decoration: none;
  color: #666;
  font-size: 0.9375rem;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s;
}

.sidebar-link:hover {
  background-color: rgba(0, 0, 0, 0.04);
  color: #000;
}

.sidebar-link-active {
  background-color: #f0f0f0 !important;
  color: #000 !important;
}

.sidebar-link-active .sidebar-link-icon {
  color: #000 !important;
}

.sidebar-link-icon {
  color: #666;
  transition: color 0.2s;
}

.sidebar-link:hover .sidebar-link-icon {
  color: #000;
}

.sidebar-footer {
  padding: 0 1rem;
  margin-top: auto;
}

.user-profile {
  cursor: pointer;
  width: 100%;
}

.user-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.user-name {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-profile:hover .user-name {
  color: #000;
}

.user-menu-card {
  width: 248px;
  border-radius: 8px;
}

.login-link {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.875rem 1rem;
  text-decoration: none;
  color: #666;
  font-size: 0.9375rem;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s;
}

.login-link:hover {
  background-color: #f0f0f0;
  color: #000;
}
</style>
