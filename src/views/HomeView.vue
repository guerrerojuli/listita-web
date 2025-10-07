<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SearchBar from '@/components/SearchBar.vue'
import ListCard from '@/components/ListCard.vue'
import { useListsStore } from '@/stores/lists'

const router = useRouter()

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

function handleListClick(listId: string) {
  router.push(`/list/${listId}`)
}

function handleToggleRecurrent(listId: string) {
  // TODO: Toggle recurrent status
  console.log('Toggle recurrent for list:', listId)
}

function handleDeleteList(listId: string) {
  if (confirm('Are you sure you want to delete this list?')) {
    listsStore.deleteList(Number(listId))
  }
}

function handleRenameList(listId: string) {
  const list = listsStore.lists.find((l) => l.id === Number(listId))
  if (list) {
    const newName = prompt('New list name:', list.name)
    if (newName && newName.trim()) {
      // TODO: Implement rename functionality in store
      console.log('Rename list:', listId, 'to', newName)
    }
  }
}

function handleTogglePrivate(listId: string) {
  // TODO: Toggle private status
  console.log('Toggle private for list:', listId)
}

function handleShareList(listId: string) {
  // TODO: Implement share functionality
  console.log('Share list:', listId)
}

onMounted(() => {
  listsStore.fetchLists().catch(() => {})
})
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
        <SearchBar v-model="searchQuery" placeholder="Search categories or products" />
      </div>

      <div v-if="recurrentLists.length > 0" class="mb-10">
        <h2 class="section-title mb-6">Recurring</h2>
        <div class="list-grid">
          <ListCard
            v-for="list in recurrentLists"
            :key="list.id"
            :list="list"
            :is-highlighted="true"
            @click="handleListClick(String(list.id))"
            @toggle-recurrent="handleToggleRecurrent(String(list.id))"
            @delete="handleDeleteList(String(list.id))"
            @rename="handleRenameList(String(list.id))"
            @toggle-private="handleTogglePrivate(String(list.id))"
            @share="handleShareList(String(list.id))"
          />
        </div>
      </div>

      <div v-if="activeLists.length > 0" class="mb-10">
        <h2 class="section-title mb-6">Active</h2>
        <div class="list-grid">
          <ListCard
            v-for="list in activeLists"
            :key="list.id"
            :list="list"
            @click="handleListClick(String(list.id))"
            @toggle-recurrent="handleToggleRecurrent(String(list.id))"
            @delete="handleDeleteList(String(list.id))"
            @rename="handleRenameList(String(list.id))"
            @toggle-private="handleTogglePrivate(String(list.id))"
            @share="handleShareList(String(list.id))"
          />
        </div>
      </div>

      <div v-if="recurrentLists.length === 0 && activeLists.length === 0" class="text-center py-16">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-clipboard-text-outline</v-icon>
        <p class="text-h6 text-medium-emphasis">No lists found</p>
      </div>

      <!-- Dialog for creating new list -->
      <v-dialog v-model="dialog" max-width="500">
        <v-card>
          <v-card-title class="text-h5">New List</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="newListName"
              label="List name"
              variant="outlined"
              autofocus
              @keyup.enter="createNewList"
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
            <v-btn
              color="primary"
              variant="elevated"
              :disabled="!newListName.trim()"
              @click="createNewList"
            >
              Create
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
