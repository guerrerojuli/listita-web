<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ShoppingList } from '@/types/api'

interface Props {
  list: ShoppingList
  isHighlighted?: boolean
  isOwner?: boolean
}

interface Emits {
  (e: 'menu-click'): void
  (e: 'click'): void
  (e: 'toggle-recurrent'): void
  (e: 'delete'): void
  (e: 'rename'): void
  (e: 'share'): void
  (e: 'purchase'): void
}

const props = withDefaults(defineProps<Props>(), {
  isHighlighted: false,
  isOwner: true,
})

const emit = defineEmits<Emits>()

const showMenu = ref(false)

const subtitle = computed(() => {
  const parts = []

  if (props.list.sharedWith && props.list.sharedWith.length > 0) {
    parts.push('Shared')
  } else {
    parts.push('Only you')
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

function shareList() {
  emit('share')
  showMenu.value = false
}

function purchaseList() {
  emit('purchase')
  showMenu.value = false
}
</script>

<template>
  <div class="list-card" @click="emit('click')">
    <div class="list-card-content">
      <div class="list-card-info">
        <div class="list-card-title-row">
          <h3 class="list-card-title">{{ list.name }}</h3>
        </div>
        <p v-if="list.description" class="list-card-description">{{ list.description }}</p>
        <p class="list-card-subtitle">{{ subtitle }}</p>
      </div>

      <v-menu v-model="showMenu" :close-on-content-click="false" location="bottom end" offset="8">
        <template v-slot:activator="{ props: menuProps }">
          <v-btn
            icon="mdi-dots-vertical"
            variant="text"
            size="small"
            class="menu-button"
            v-bind="menuProps"
            @click.stop
          />
        </template>

        <v-card min-width="220" class="menu-card" elevation="8">
          <v-list class="menu-list" density="compact">
            <v-list-item
              v-if="isOwner"
              @click="toggleRecurrent"
              class="menu-item menu-item-recurring"
              rounded="lg"
            >
              <template v-slot:prepend>
                <v-icon
                  :icon="list.recurring ? 'mdi-star' : 'mdi-star-outline'"
                  size="20"
                  class="menu-icon"
                  :class="{ 'menu-icon-active': list.recurring }"
                />
              </template>
              <v-list-item-title class="menu-text">
                {{ list.recurring ? 'Remove from Recurring' : 'Mark as Recurring' }}
              </v-list-item-title>
            </v-list-item>

            <v-divider v-if="isOwner" class="menu-divider" />

            <v-list-item v-if="isOwner" @click="renameList" class="menu-item" rounded="lg">
              <template v-slot:prepend>
                <v-icon icon="mdi-pencil-outline" size="20" class="menu-icon" />
              </template>
              <v-list-item-title class="menu-text">Edit</v-list-item-title>
            </v-list-item>

            <v-list-item v-if="isOwner" @click="shareList" class="menu-item" rounded="lg">
              <template v-slot:prepend>
                <v-icon icon="mdi-share-variant-outline" size="20" class="menu-icon" />
              </template>
              <v-list-item-title class="menu-text">Share</v-list-item-title>
            </v-list-item>

            <v-divider v-if="isOwner" class="menu-divider" />

            <v-list-item @click="purchaseList" class="menu-item" rounded="lg">
              <template v-slot:prepend>
                <v-icon icon="mdi-cart-check" size="20" class="menu-icon" />
              </template>
              <v-list-item-title class="menu-text">Mark as Purchased</v-list-item-title>
            </v-list-item>

            <v-divider v-if="isOwner" class="menu-divider" />

            <v-list-item
              v-if="isOwner"
              @click="deleteList"
              class="menu-item menu-item-danger"
              rounded="lg"
            >
              <template v-slot:prepend>
                <v-icon icon="mdi-delete-outline" size="20" class="menu-icon menu-icon-delete" />
              </template>
              <v-list-item-title class="menu-text">Delete</v-list-item-title>
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

.list-card-title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.list-card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #000;
  margin: 0;
}

.list-card-description {
  font-size: 0.875rem;
  color: #555;
  margin: 0.25rem 0 0.5rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
}

.list-card-subtitle {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
}

.menu-button {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.menu-button:hover {
  opacity: 1;
}

.menu-card {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.menu-list {
  padding: 0.5rem;
  background: white;
}

.menu-list :deep(.v-list-item) {
  padding-left: 12px !important;
  padding-right: 12px !important;
}

.menu-item {
  cursor: pointer;
  min-height: 48px;
  padding: 0.5rem 0.75rem !important;
  transition: all 0.15s ease;
}

.menu-item:hover {
  background-color: #f5f5f5 !important;
}

.menu-item:active {
  background-color: #eeeeee !important;
}

.menu-icon {
  color: #616161;
  transition: color 0.15s ease;
}

.menu-icon-delete {
  color: #e53935 !important;
}

.menu-icon-active {
  color: #ffa726 !important;
}

.menu-item:hover .menu-icon {
  color: #424242;
}

.menu-item:hover .menu-icon-active {
  color: #ffb74d !important;
}

.menu-text {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #212121;
  letter-spacing: -0.01em;
}

.menu-item-recurring:hover {
  background-color: #fff3cd !important;
}

.menu-item-recurring:hover .menu-icon {
  color: #ffa726 !important;
}

.menu-item-danger:hover {
  background-color: #ffebee !important;
}

.menu-item-danger:hover .menu-icon {
  color: #d32f2f;
}

.menu-item-danger .menu-text {
  color: #e53935;
}

.menu-divider {
  margin: 0;
  border-color: rgba(0, 0, 0, 0.08);
}
</style>
