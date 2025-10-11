<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import SearchBar from '@/components/SearchBar.vue'
import ListCard from '@/components/ListCard.vue'
import BaseDialog from '@/components/BaseDialog.vue'
import BaseInput from '@/components/BaseInput.vue'
import { useListsStore } from '@/stores/lists'
import { usePurchasesStore } from '@/stores/purchases'

const router = useRouter()

const listsStore = useListsStore()
const purchasesStore = usePurchasesStore()
const { searchQuery, recurrentLists, activeLists } = storeToRefs(listsStore)

const dialog = ref(false)
const newListName = ref('')
const showPurchasesDialog = ref(false)
const selectedListForHistory = ref<number | null>(null)
const showShareDialog = ref(false)
const shareEmail = ref('')
const shareListId = ref<number | null>(null)
const shareError = ref('')

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

async function handleToggleRecurrent(listId: string) {
  const list = listsStore.lists.find((l) => l.id === Number(listId))
  if (list) {
    await listsStore.updateList(Number(listId), { recurring: !list.recurring })
  }
}

function handleDeleteList(listId: string) {
  if (confirm('Are you sure you want to delete this list?')) {
    listsStore.deleteList(Number(listId))
  }
}

async function handleRenameList(listId: string) {
  const list = listsStore.lists.find((l) => l.id === Number(listId))
  if (list) {
    const newName = prompt('New list name:', list.name)
    if (newName && newName.trim()) {
      await listsStore.updateList(Number(listId), { name: newName.trim() })
    }
  }
}

function handleTogglePrivate(listId: string) {
  // TODO: Toggle private status
  console.log('Toggle private for list:', listId)
}

function handleShareList(listId: string) {
  shareListId.value = Number(listId)
  shareEmail.value = ''
  shareError.value = ''
  showShareDialog.value = true
}

async function submitShareList() {
  if (shareListId.value && shareEmail.value.trim()) {
    try {
      await listsStore.shareList(shareListId.value, shareEmail.value.trim())
      showShareDialog.value = false
      alert('List shared successfully!')
    } catch (err: any) {
      shareError.value = err.message || 'Failed to share list'
    }
  }
}

function handleViewPurchaseHistory(listId: string) {
  selectedListForHistory.value = Number(listId)
  purchasesStore.fetchPurchases({ list_id: Number(listId) })
  showPurchasesDialog.value = true
}

async function handleRestorePurchase(purchaseId: number) {
  if (confirm('Restore this purchase as a new shopping list?')) {
    try {
      await purchasesStore.restorePurchase(purchaseId)
      await listsStore.fetchLists()
      showPurchasesDialog.value = false
      alert('Purchase restored successfully!')
    } catch (err) {
      alert('Failed to restore purchase')
    }
  }
}

onMounted(() => {
  listsStore.fetchLists().catch(() => {})
})
</script>

<template>
  <NavBar />
  <div class="home-container">
    <v-container class="py-8">
      <div class="d-flex align-center justify-space-between mb-8">
        <h1 class="page-title">Lists</h1>
        <v-btn class="new-list-btn" elevation="0" size="default" @click="handleNewList">
          New List
        </v-btn>
      </div>

      <div class="mb-10" style="max-width: 900px; margin-left: auto; margin-right: auto">
        <SearchBar v-model="searchQuery" placeholder="Search for existing lists" />
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
            @view-history="handleViewPurchaseHistory(String(list.id))"
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
            @view-history="handleViewPurchaseHistory(String(list.id))"
          />
        </div>
      </div>

      <div v-if="recurrentLists.length === 0 && activeLists.length === 0" class="text-center py-16">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-clipboard-text-outline</v-icon>
        <p class="text-h6 text-medium-emphasis">No lists found</p>
      </div>

      <!-- Dialog for creating new list -->
      <BaseDialog v-model="dialog" title="New List">
        <BaseInput v-model="newListName" label="List name" autofocus @keyup.enter="createNewList" />

        <template #actions="{ close }">
          <v-btn class="btn-cancel" elevation="0" @click="close">Cancel</v-btn>
          <v-btn
            class="btn-add"
            elevation="0"
            :disabled="!newListName.trim()"
            @click="createNewList"
          >
            Create
          </v-btn>
        </template>
      </BaseDialog>

      <!-- Dialog for purchase history -->
      <BaseDialog v-model="showPurchasesDialog" title="Purchase History" :max-width="800">
        <div v-if="purchasesStore.loading" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" />
        </div>
        <div v-else-if="purchasesStore.purchases.length === 0" class="text-center py-8">
          <p class="text-body-1 text-medium-emphasis">No purchase history for this list</p>
        </div>
        <v-list v-else>
          <v-list-item
            v-for="purchase in purchasesStore.purchases"
            :key="purchase.id"
            class="mb-2"
            border
            rounded
          >
            <template v-slot:prepend>
              <v-icon icon="mdi-cart-check" />
            </template>
            <v-list-item-title>
              Purchase #{{ purchase.id }} - {{ purchase.listItemArray.length }} items
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ new Date(purchase.createdAt || '').toLocaleDateString() }}
            </v-list-item-subtitle>
            <template v-slot:append>
              <v-btn
                icon="mdi-restore"
                variant="text"
                size="small"
                @click.stop="handleRestorePurchase(purchase.id)"
              />
            </template>
          </v-list-item>
        </v-list>

        <template #actions="{ close }">
          <v-btn class="btn-cancel" elevation="0" @click="close">Close</v-btn>
        </template>
      </BaseDialog>

      <!-- Dialog for sharing list -->
      <BaseDialog v-model="showShareDialog" title="Share List">
        <v-alert v-if="shareError" type="error" class="mb-4" density="comfortable">
          {{ shareError }}
        </v-alert>
        <BaseInput
          v-model="shareEmail"
          label="Email address"
          type="email"
          placeholder="Enter email to share with"
          autofocus
          @keyup.enter="submitShareList"
        />

        <template #actions="{ close }">
          <v-btn class="btn-cancel" elevation="0" @click="close">Cancel</v-btn>
          <v-btn
            class="btn-add"
            elevation="0"
            :disabled="!shareEmail.trim()"
            @click="submitShareList"
          >
            Share
          </v-btn>
        </template>
      </BaseDialog>
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
