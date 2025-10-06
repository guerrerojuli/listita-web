<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import SearchBar from '@/components/SearchBar.vue'
import ListCard from '@/components/ListCard.vue'
import { useListsStore } from '@/stores/lists'

const listsStore = useListsStore()
const { searchQuery, recurrentLists, activeLists } = storeToRefs(listsStore)

const dialog = ref(false)
const newListName = ref('')

function handleNewList() {
  dialog.value = true
}

function createNewList() {
  if (newListName.value.trim()) {
    listsStore.createList(newListName.value.trim())
    newListName.value = ''
    dialog.value = false
  }
}

function handleListMenu(listId: string) {
  console.log('Menu clicked for list:', listId)
}

function handleListClick(listId: string) {
  console.log('List clicked:', listId)
}
</script>

<template>
  <div class="home-container">
    <v-container class="py-8">
      <div class="d-flex align-center justify-space-between mb-8">
        <h1 class="page-title">Lists</h1>
        <v-btn class="new-list-btn" elevation="0" size="default" @click="handleNewList">
          New List
        </v-btn>
      </div>

      <div class="mb-10" style="max-width: 900px; margin-left: auto; margin-right: auto">
        <SearchBar v-model="searchQuery" placeholder="Buscar categorías o productos" />
      </div>

      <div v-if="recurrentLists.length > 0" class="mb-10">
        <h2 class="section-title mb-6">Recurrentes</h2>
        <div class="list-grid">
          <ListCard
            v-for="list in recurrentLists"
            :key="list.id"
            :list="list"
            :is-highlighted="true"
            @menu-click="handleListMenu(list.id)"
            @click="handleListClick(list.id)"
          />
        </div>
      </div>

      <div v-if="activeLists.length > 0" class="mb-10">
        <h2 class="section-title mb-6">Activas</h2>
        <div class="list-grid">
          <ListCard
            v-for="list in activeLists"
            :key="list.id"
            :list="list"
            @menu-click="handleListMenu(list.id)"
            @click="handleListClick(list.id)"
          />
        </div>
      </div>

      <div v-if="recurrentLists.length === 0 && activeLists.length === 0" class="text-center py-16">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-clipboard-text-outline</v-icon>
        <p class="text-h6 text-medium-emphasis">No se encontraron listas</p>
      </div>

      <!-- Dialog for creating new list -->
      <v-dialog v-model="dialog" max-width="500">
        <v-card>
          <v-card-title class="text-h5">Nueva Lista</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="newListName"
              label="Nombre de la lista"
              variant="outlined"
              autofocus
              @keyup.enter="createNewList"
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="dialog = false">Cancelar</v-btn>
            <v-btn
              color="primary"
              variant="elevated"
              :disabled="!newListName.trim()"
              @click="createNewList"
            >
              Crear
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<style scoped>
.home-container {
  background-color: #fafafa;
  min-height: calc(100vh - 64px);
}

.page-title {
  font-size: 3.5rem;
  font-weight: 700;
  color: #000;
  letter-spacing: -0.5px;
}

.new-list-btn {
  background-color: #000 !important;
  color: white !important;
  text-transform: none;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 6px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #000;
}

.list-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
