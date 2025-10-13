<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import SearchDropdown from '@/components/SearchDropdown.vue'
import ListCard from '@/components/ListCard.vue'
import BaseDialog from '@/components/BaseDialog.vue'
import BaseInput from '@/components/BaseInput.vue'
import BaseNotification from '@/components/BaseNotification.vue'
import { useListsStore } from '@/stores/lists'
import { usePurchasesStore } from '@/stores/purchases'
import { useNotification } from '@/composables/useNotification'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'

const router = useRouter()
const { showSuccess, showError, showWarning } = useNotification()

const listsStore = useListsStore()
const purchasesStore = usePurchasesStore()
const { recurrentLists, activeLists, loading, error, hasMore, loadingMore } =
  storeToRefs(listsStore)

const loadMoreTrigger = ref<HTMLElement | null>(null)

const searchQuery = ref('')

const dialog = ref(false)
const newListName = ref('')
const newListDescription = ref('')
const newListWarning = ref('')
const showPurchasesDialog = ref(false)
const selectedListForHistory = ref<number | null>(null)
const showShareDialog = ref(false)
const shareEmail = ref('')
const shareListId = ref<number | null>(null)
const shareError = ref('')
const shareLoading = ref(false)
const showDeleteDialog = ref(false)
const deleteListId = ref<number | null>(null)
const deleteListName = ref('')

const showEditListDialog = ref(false)
const editingListId = ref<number | null>(null)
const editListName = ref('')
const editListDescription = ref('')

const filteredRecurrentLists = computed(() => {
  if (!searchQuery.value) return recurrentLists.value
  return recurrentLists.value.filter((list) =>
    list.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

const filteredActiveLists = computed(() => {
  if (!searchQuery.value) return activeLists.value
  return activeLists.value.filter((list) =>
    list.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

function handleNewList() {
  newListName.value = ''
  newListDescription.value = ''
  newListWarning.value = ''
  dialog.value = true
}

async function createNewList() {
  if (newListName.value.trim()) {
    try {
      await listsStore.createList(newListName.value.trim(), newListDescription.value.trim() || undefined, false)
      newListName.value = ''
      newListDescription.value = ''
      newListWarning.value = ''
      dialog.value = false
      showSuccess('List created successfully!')
    } catch (err: any) {
      if (err.message && err.message.includes('already exists')) {
        newListWarning.value = 'A list with this name already exists or was recently deleted. Please use a different name.'
      } else {
        newListWarning.value = err.message || 'Failed to create list'
      }
    }
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
  const list = listsStore.lists.find((l) => l.id === Number(listId))
  if (list) {
    deleteListId.value = Number(listId)
    deleteListName.value = list.name
    showDeleteDialog.value = true
  }
}

async function confirmDeleteList() {
  if (deleteListId.value) {
    try {
      await listsStore.deleteList(deleteListId.value)
      showDeleteDialog.value = false
      deleteListId.value = null
      deleteListName.value = ''
      showSuccess('List deleted successfully!')
    } catch (err: any) {
      showError(err.message || 'Failed to delete list')
      showDeleteDialog.value = false
    }
  }
}

function handleRenameList(listId: string) {
  const list = listsStore.lists.find((l) => l.id === Number(listId))
  if (list) {
    editingListId.value = Number(listId)
    editListName.value = list.name
    editListDescription.value = list.description || ''
    showEditListDialog.value = true
  }
}

async function confirmEditList() {
  if (editingListId.value && editListName.value.trim()) {
    try {
      await listsStore.updateList(editingListId.value, { 
        name: editListName.value.trim(),
        description: editListDescription.value.trim() || undefined
      })
      showEditListDialog.value = false
      editingListId.value = null
      editListName.value = ''
      editListDescription.value = ''
    } catch (err: any) {
      console.error('Failed to update list:', err)
      alert('Failed to update list')
    }
  }
}

function handleTogglePrivate(listId: string) {
  console.log('Toggle private for list:', listId)
}

function handleShareList(listId: string) {
  shareListId.value = Number(listId)
  shareEmail.value = ''
  shareError.value = ''
  shareLoading.value = false
  showShareDialog.value = true
}

async function submitShareList() {
  if (shareListId.value && shareEmail.value.trim() && !shareLoading.value) {
    shareLoading.value = true
    shareError.value = ''
    try {
      await listsStore.shareList(shareListId.value, shareEmail.value.trim())
      showShareDialog.value = false
      shareLoading.value = false
      showSuccess('List shared successfully!')
    } catch (err: any) {
      shareError.value = err.message || 'Failed to share list'
      shareLoading.value = false
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
      showSuccess('Purchase restored successfully!')
    } catch (err) {
      showError('Failed to restore purchase')
    }
  }
}

const { setupObserver } = useInfiniteScroll({
  trigger: loadMoreTrigger,
  hasMore,
  loadingMore,
  onLoadMore: () => listsStore.loadMoreLists(),
})

onMounted(() => {
  listsStore.fetchLists().catch(() => {})
  setupObserver()
})

watch(
  () => [...filteredRecurrentLists.value, ...filteredActiveLists.value].length,
  (newLength) => {
    if (newLength > 0) {
      setupObserver()
    }
  },
)
</script>

<template>
  <NavBar />
  <div class="home-container">
    <v-container class="py-8">
      <h1 class="page-title">Lists</h1>

      <div v-if="!error" class="search-row mb-10">
        <SearchDropdown
          v-model="searchQuery"
          placeholder="Search lists..."
          :show-dropdown="false"
        />
        <v-btn class="new-list-btn" elevation="0" :height="44" @click="handleNewList">
          New List
          <v-icon size="20" class="ml-2">mdi-file-edit-outline</v-icon>
        </v-btn>
      </div>

      <div
        v-if="filteredRecurrentLists.length > 0 && !error"
        class="mb-10"
        style="max-width: 900px; margin-left: auto; margin-right: auto"
      >
        <h2 class="section-title mb-6">Recurring</h2>
        <div class="list-grid">
          <ListCard
            v-for="list in filteredRecurrentLists"
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

      <div
        v-if="filteredActiveLists.length > 0 && !error"
        class="mb-10"
        style="max-width: 900px; margin-left: auto; margin-right: auto"
      >
        <h2 class="section-title mb-6">Active</h2>
        <div class="list-grid">
          <ListCard
            v-for="list in filteredActiveLists"
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

      <!-- Infinite scroll trigger -->
      <div
        v-if="
          (filteredRecurrentLists.length > 0 || filteredActiveLists.length > 0) &&
          !error &&
          !searchQuery
        "
        ref="loadMoreTrigger"
        class="load-more-trigger"
        style="max-width: 900px; margin-left: auto; margin-right: auto"
      >
        <div v-if="loadingMore" class="text-center py-4">
          <v-progress-circular indeterminate color="primary" size="32" />
        </div>
      </div>

      <div v-if="loading" class="text-center py-16">
        <v-progress-circular indeterminate color="primary" size="64" class="mb-4" />
        <p class="text-h6 text-medium-emphasis">Loading lists...</p>
      </div>

      <div v-else-if="error" class="text-center py-16">
        <v-icon size="64" color="error" class="mb-4">mdi-alert-circle-outline</v-icon>
        <p class="text-h6 text-medium-emphasis">{{ error }}</p>
      </div>

      <div
        v-else-if="
          filteredRecurrentLists.length === 0 && filteredActiveLists.length === 0 && !searchQuery
        "
        class="text-center py-16"
      >
        <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-clipboard-text-outline</v-icon>
        <p class="text-h6 text-medium-emphasis">No lists found</p>
      </div>

      <div
        v-else-if="
          filteredRecurrentLists.length === 0 && filteredActiveLists.length === 0 && searchQuery
        "
        class="text-center py-16"
      >
        <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-magnify</v-icon>
        <p class="text-h6 text-medium-emphasis">No lists match your search</p>
        <p class="text-body-2 text-medium-emphasis mb-4">Try a different search term</p>
      </div>

      <BaseDialog v-model="dialog" title="New List">
        <BaseInput v-model="newListName" label="List name" autofocus @keyup.enter="createNewList" />
        <BaseInput v-model="newListDescription" label="Description (optional)" class="mt-4" />

        <template #actions="{ close }">
          <div style="position: absolute; bottom: 80px; left: 24px; right: 24px">
            <BaseNotification
              v-if="newListWarning"
              variant="text"
              type="warning"
              :message="newListWarning"
              :model-value="!!newListWarning"
            />
          </div>
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

      <BaseDialog v-model="showShareDialog" title="Share List">
        <BaseInput
          v-model="shareEmail"
          label="Email address"
          type="email"
          placeholder="Enter email to share with"
          autofocus
          @keyup.enter="submitShareList"
        />

        <template #actions="{ close }">
          <div style="position: absolute; bottom: 80px; left: 24px; right: 24px">
            <BaseNotification
              v-if="shareError"
              variant="text"
              type="error"
              :message="shareError"
              :model-value="!!shareError"
            />
          </div>
          <v-btn class="btn-cancel" elevation="0" @click="close">Cancel</v-btn>
          <v-btn
            class="btn-add"
            elevation="0"
            :disabled="!shareEmail.trim() || shareLoading"
            :loading="shareLoading"
            @click="submitShareList"
          >
            Share
          </v-btn>
        </template>
      </BaseDialog>

      <!-- Edit List Dialog -->
      <BaseDialog v-model="showEditListDialog" title="Edit List" :max-width="450">
        <BaseInput
          v-model="editListName"
          label="List Name"
          placeholder="Enter list name"
          class="mb-4"
        />
        <BaseInput
          v-model="editListDescription"
          label="Description (optional)"
          placeholder="Enter list description"
        />

        <template #actions="{ close }">
          <v-btn class="btn-cancel" elevation="0" @click="close">Cancel</v-btn>
          <v-btn
            class="btn-add"
            elevation="0"
            :disabled="!editListName.trim()"
            @click="confirmEditList"
          >
            Save Changes
          </v-btn>
        </template>
      </BaseDialog>

      <BaseDialog v-model="showDeleteDialog" title="Delete List" :max-width="450">
        <div class="delete-confirmation">
          <v-icon icon="mdi-alert-circle-outline" size="48" color="error" class="mb-4" />
          <p class="delete-message">
            Are you sure you want to delete <strong>{{ deleteListName }}</strong
            >?
          </p>
          <p class="delete-warning">This action cannot be undone.</p>
        </div>

        <template #actions="{ close }">
          <v-btn class="btn-cancel" elevation="0" @click="close">Cancel</v-btn>
          <v-btn class="btn-remove" elevation="0" @click="confirmDeleteList">Delete</v-btn>
        </template>
      </BaseDialog>
    </v-container>
  </div>
</template>

<style scoped>
.home-container {
  min-height: 100vh;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #000;
  max-width: 900px;
  margin: 0 auto 2rem auto;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}

.new-list-btn {
  background-color: #999999 !important;
  color: #ffffff !important;
  text-transform: none;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid #838383 !important;
  border-radius: 12px;
  flex-shrink: 0;
  min-width: 120px;
  transition: background-color 0.2s ease;
}

.new-list-btn:hover {
  background-color: #757575 !important;
  color: white !important;
}

.search-hint {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #666;
  padding: 0 0.75rem 0.5rem 0.75rem;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
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

.delete-confirmation {
  text-align: center;
  padding: 1rem 0;
}

.delete-message {
  font-size: 1rem;
  color: #212121;
  margin-bottom: 0.5rem;
}

.delete-message strong {
  color: #000;
  font-weight: 600;
}

.delete-warning {
  font-size: 0.875rem;
  color: #e53935;
  margin: 0;
}

.btn-remove {
  color: white !important;
  background-color: #e53935 !important;
  text-transform: none;
  font-weight: 500;
  padding: 0 24px !important;
  border-radius: 8px !important;
}

.btn-remove:hover {
  background-color: #c62828 !important;
}

.load-more-trigger {
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}
</style>
