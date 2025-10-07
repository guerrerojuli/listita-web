<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
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

function handleLogout() {
  auth.logout()
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
  } catch (err: any) {
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
  } catch (err: any) {
    passwordError.value = 'Failed to change password. Check your current password.'
  }
}
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

      <div v-if="auth.isAuthenticated">
        <v-menu v-model="showProfileMenu" location="bottom end">
          <template v-slot:activator="{ props }">
            <v-btn icon="mdi-account-circle" variant="text" size="large" v-bind="props" />
          </template>
          <v-card min-width="280">
            <v-list>
              <v-list-item v-if="auth.user" class="pb-2">
                <v-list-item-title class="font-weight-bold">{{ auth.user.name }} {{ auth.user.surname }}</v-list-item-title>
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
      <RouterLink v-else to="/login" class="nav-link">Login</RouterLink>
    </v-container>
  </v-app-bar>

  <!-- Profile Edit Dialog -->
  <v-dialog v-model="showProfileDialog" max-width="500">
    <v-card>
      <v-card-title class="text-h5">Edit Profile</v-card-title>
      <v-card-text>
        <v-alert v-if="profileError" type="error" class="mb-4" density="comfortable">
          {{ profileError }}
        </v-alert>
        <v-alert v-if="profileSuccess" type="success" class="mb-4" density="comfortable">
          {{ profileSuccess }}
        </v-alert>
        <v-text-field v-model="editName" label="First Name" variant="outlined" class="mb-4" />
        <v-text-field v-model="editSurname" label="Last Name" variant="outlined" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="showProfileDialog = false">Cancel</v-btn>
        <v-btn color="primary" variant="elevated" @click="handleUpdateProfile">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Password Change Dialog -->
  <v-dialog v-model="showPasswordDialog" max-width="500">
    <v-card>
      <v-card-title class="text-h5">Change Password</v-card-title>
      <v-card-text>
        <v-alert v-if="passwordError" type="error" class="mb-4" density="comfortable">
          {{ passwordError }}
        </v-alert>
        <v-alert v-if="passwordSuccess" type="success" class="mb-4" density="comfortable">
          {{ passwordSuccess }}
        </v-alert>
        <v-text-field 
          v-model="currentPassword" 
          label="Current Password" 
          type="password" 
          variant="outlined" 
          class="mb-4" 
        />
        <v-text-field 
          v-model="newPassword" 
          label="New Password" 
          type="password" 
          variant="outlined" 
          class="mb-4"
          hint="Minimum 6 characters"
        />
        <v-text-field 
          v-model="confirmPassword" 
          label="Confirm New Password" 
          type="password" 
          variant="outlined" 
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="showPasswordDialog = false">Cancel</v-btn>
        <v-btn color="primary" variant="elevated" @click="handleChangePassword">Change Password</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
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
