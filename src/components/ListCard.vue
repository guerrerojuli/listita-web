<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ShoppingList } from '@/types/list'

interface Props {
  list: ShoppingList
  isHighlighted?: boolean
}

interface Emits {
  (e: 'menu-click'): void
  (e: 'click'): void
  (e: 'toggle-recurrent'): void
  (e: 'delete'): void
  (e: 'rename'): void
  (e: 'toggle-private'): void
  (e: 'share'): void
}

const props = withDefaults(defineProps<Props>(), {
  isHighlighted: false,
})

const emit = defineEmits<Emits>()

const showMenu = ref(false)

const subtitle = computed(() => {
  const parts = []

  if (props.list.peopleCount) {
    parts.push(`${props.list.peopleCount} people`)
  } else if (props.list.isShared) {
    parts.push('Shared')
  } else {
    parts.push('Only you')
  }

  if (props.list.productCount === 0) {
    parts.push('No products')
  } else {
    parts.push(`${props.list.productCount} products`)
  }

  return parts.join(' - ')
})

function toggleRecurrent() {
  emit('toggle-recurrent')
  showMenu.value = false
}

function deleteList() {
  emit('delete')
  showMenu.value = false
}

function renameList() {
  emit('rename')
  showMenu.value = false
}

function togglePrivate() {
  emit('toggle-private')
  showMenu.value = false
}

function shareList() {
  emit('share')
  showMenu.value = false
}
</script>

<template>
  <div class="list-card" @click="emit('click')">
    <div class="list-card-content">
      <div class="list-card-info">
        <h3 class="list-card-title">{{ list.name }}</h3>
        <p class="list-card-subtitle">{{ subtitle }}</p>
      </div>

      <v-menu v-model="showMenu" :close-on-content-click="false" location="bottom end">
        <template v-slot:activator="{ props: menuProps }">
          <v-btn
            icon="mdi-dots-vertical"
            variant="text"
            size="small"
            v-bind="menuProps"
            @click.stop
          />
        </template>

        <v-card min-width="240" class="menu-card" elevation="0">
          <v-list class="menu-list">
            <v-list-item @click="toggleRecurrent" class="menu-item" rounded="lg">
              <template v-slot:prepend>
                <v-icon
                  :icon="list.isRecurrent ? 'mdi-star' : 'mdi-star-outline'"
                  size="20"
                  class="menu-icon"
                />
              </template>
              <v-list-item-title class="menu-text">Recurrente</v-list-item-title>
            </v-list-item>

            <v-list-item @click="deleteList" class="menu-item menu-item-danger" rounded="lg">
              <template v-slot:prepend>
                <v-icon icon="mdi-delete-outline" size="20" class="menu-icon" />
              </template>
              <v-list-item-title class="menu-text">Eliminar</v-list-item-title>
            </v-list-item>

            <v-divider class="menu-divider" />

            <v-list-item @click="renameList" class="menu-item" rounded="lg">
              <template v-slot:prepend>
                <v-icon icon="mdi-pencil-outline" size="20" class="menu-icon" />
              </template>
              <v-list-item-title class="menu-text">Cambiar nombre</v-list-item-title>
            </v-list-item>

            <v-list-item @click="togglePrivate" class="menu-item" rounded="lg">
              <template v-slot:prepend>
                <v-icon icon="mdi-lock-outline" size="20" class="menu-icon" />
              </template>
              <v-list-item-title class="menu-text">Hacer privada</v-list-item-title>
            </v-list-item>

            <v-list-item @click="shareList" class="menu-item" rounded="lg">
              <template v-slot:prepend>
                <v-icon icon="mdi-account-multiple-outline" size="20" class="menu-icon" />
              </template>
              <v-list-item-title class="menu-text">Compartir</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
    </div>
  </div>
</template>

<style scoped>
.list-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.list-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.list-card-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.list-card-info {
  flex: 1;
}

.list-card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #000;
  margin: 0 0 0.25rem 0;
}

.list-card-subtitle {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
}

.menu-card {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
}

.menu-list {
  padding: 0.5rem;
  background: white;
}

.menu-item {
  cursor: pointer;
  min-height: 44px;
  margin-bottom: 2px;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background-color: #f5f5f5 !important;
}

.menu-item:active {
  background-color: #eeeeee !important;
}

.menu-icon {
  color: #424242;
  margin-right: 12px;
}

.menu-text {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #212121;
}

.menu-item-danger:hover {
  background-color: #ffebee !important;
}

.menu-item-danger .menu-icon {
  color: #f44336;
}

.menu-item-danger .menu-text {
  color: #f44336;
}

.menu-divider {
  margin: 0.5rem 0;
  border-color: #e0e0e0;
}
</style>
