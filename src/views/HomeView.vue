<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import SearchDropdown from '@/components/SearchDropdown.vue'
import ListCard from '@/components/ListCard.vue'
import BaseDialog from '@/components/BaseDialog.vue'
import BaseInput from '@/components/BaseInput.vue'
import BaseTextarea from '@/components/BaseTextarea.vue'
import BaseNotification from '@/components/BaseNotification.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useListsStore } from '@/stores/lists'
import { useAuthStore } from '@/stores/auth'
import { useNotification } from '@/composables/useNotification'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'

const router = useRouter()
const { showSuccess, showError, showWarning } = useNotification()

const listsStore = useListsStore()
const authStore = useAuthStore()
const { recurrentLists, activeLists, loading, error, hasMore, loadingMore } =
  storeToRefs(listsStore)

const loadMoreTrigger = ref<HTMLElement | null>(null)

const searchQuery = ref('')

const dialog = ref(false)
const newListName = ref('')
const newListDescription = ref('')
const newListRecurring = ref(false)
const newListWarning = ref('')
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

const showPurchaseDialog = ref(false)
const purchaseListId = ref<string | null>(null)

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

const currentShareList = computed(() => {
  if (!shareListId.value) return null
  return listsStore.lists.find((l) => l.id === shareListId.value)
})

const isOwner = computed(() => {
  if (!currentShareList.value || !authStore.user) return false
  return currentShareList.value.owner?.id === authStore.user.id
})

function isListOwner(listId: number): boolean {
  const list = listsStore.lists.find((l) => l.id === listId)
  if (!list || !authStore.user) return false
  return list.owner?.id === authStore.user.id
}

function handleSearchInput(value: string) {
  searchQuery.value = value
}

function handleNewList() {
  newListName.value = ''
  newListDescription.value = ''
  newListRecurring.value = false
  newListWarning.value = ''
  dialog.value = true
}

function handleCreateFromSearch() {
  newListName.value = searchQuery.value.trim()
  newListDescription.value = ''
  newListRecurring.value = false
  searchQuery.value = ''
  newListWarning.value = ''
  dialog.value = true
}

async function createNewList() {
  if (newListName.value.trim()) {
    try {
      await listsStore.createList(
        newListName.value.trim(),
        newListDescription.value?.trim() || '',
        newListRecurring.value,
      )
      newListName.value = ''
      newListDescription.value = ''
      newListRecurring.value = false
      newListWarning.value = ''
      dialog.value = false
      showSuccess('List created successfully!')
    } catch (err: any) {
      if (err.message && err.message.includes('already exists')) {
        newListWarning.value =
          'A list with this name already exists or was recently deleted. Please use a different name.'
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
        description: editListDescription.value?.trim() || '',
      })
      showEditListDialog.value = false
      editingListId.value = null
      editListName.value = ''
      editListDescription.value = ''
    } catch (err: any) {
      console.error('Failed to update list:', err)
      showError('Failed to update list')
    }
  }
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
      shareEmail.value = ''
      shareLoading.value = false
      showSuccess('List shared successfully!')
    } catch (err: any) {
      shareError.value = err.message || 'Failed to share list'
      shareLoading.value = false
    }
  }
}

async function handleRemoveUser(userId: number) {
  if (!shareListId.value || !currentShareList.value) return
  try {
    // Optimistically update UI
    if (currentShareList.value.sharedWith) {
      const index = currentShareList.value.sharedWith.findIndex((u) => u.id === userId)
      if (index !== -1) {
        currentShareList.value.sharedWith.splice(index, 1)
      }
    }

    await listsStore.revokeAccess(shareListId.value, userId)
    showSuccess('User removed successfully!')
  } catch (err: any) {
    // Revert on error - reload the list
    await listsStore.fetchLists()
    showError(err.message || 'Failed to remove user')
  }
}

function handlePurchaseList(listId: string) {
  purchaseListId.value = listId
  showPurchaseDialog.value = true
}

async function confirmPurchase() {
  if (purchaseListId.value) {
    try {
      await listsStore.purchaseList(Number(purchaseListId.value))
      showSuccess('List purchased successfully!')
    } catch (err: any) {
      showError(err.message || 'Failed to purchase list')
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
            :is-owner="isListOwner(list.id)"
            @click="handleListClick(String(list.id))"
            @toggle-recurrent="handleToggleRecurrent(String(list.id))"
            @delete="handleDeleteList(String(list.id))"
            @rename="handleRenameList(String(list.id))"
            @share="handleShareList(String(list.id))"
            @purchase="handlePurchaseList(String(list.id))"
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
            :is-owner="isListOwner(list.id)"
            @click="handleListClick(String(list.id))"
            @toggle-recurrent="handleToggleRecurrent(String(list.id))"
            @delete="handleDeleteList(String(list.id))"
            @rename="handleRenameList(String(list.id))"
            @share="handleShareList(String(list.id))"
            @purchase="handlePurchaseList(String(list.id))"
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
        <BaseTextarea
          v-model="newListDescription"
          label="Description (optional)"
          class="mt-4"
          :maxlength="250"
          counter
          :rows="3"
        />
        <v-checkbox
          v-model="newListRecurring"
          label="Recurring"
          color="primary"
          density="compact"
          hide-details
          class="mt-2"
        />

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

      <BaseDialog
        v-model="showShareDialog"
        :title="isOwner ? 'Share List' : 'Shared With'"
        :max-width="500"
      >
        <div v-if="currentShareList">
          <h3 class="share-list-name">{{ currentShareList.name }}</h3>

          <BaseInput
            v-if="isOwner"
            v-model="shareEmail"
            label="Email address"
            type="email"
            placeholder="Enter email to share with"
            @keyup.enter="submitShareList"
          />

          <div
            v-if="
              currentShareList.owner ||
              (currentShareList.sharedWith && currentShareList.sharedWith.length > 0)
            "
            class="shared-users-container"
            :class="{ 'no-input': !isOwner }"
          >
            <div v-if="currentShareList.owner" class="shared-users-section">
              <h4 class="section-subtitle">Owner</h4>
              <div class="user-item">
                <v-icon icon="mdi-account" size="18" class="user-icon" />
                <div class="user-info">
                  <p class="user-name">
                    {{ currentShareList.owner.name }} {{ currentShareList.owner.surname }}
                  </p>
                  <p class="user-email">{{ currentShareList.owner.email }}</p>
                </div>
              </div>
            </div>

            <div
              v-if="currentShareList.sharedWith && currentShareList.sharedWith.length > 0"
              class="shared-users-section"
            >
              <h4 class="section-subtitle">Shared with</h4>
              <div v-for="user in currentShareList.sharedWith" :key="user.id" class="user-item">
                <v-icon icon="mdi-account-multiple" size="18" class="user-icon" />
                <div class="user-info">
                  <p class="user-name">{{ user.name }} {{ user.surname }}</p>
                  <p class="user-email">{{ user.email }}</p>
                </div>
                <v-btn
                  v-if="isOwner"
                  icon="mdi-close"
                  variant="text"
                  size="x-small"
                  class="remove-user-btn"
                  @click="handleRemoveUser(user.id)"
                />
              </div>
            </div>
          </div>
        </div>

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
          <v-btn class="btn-cancel" elevation="0" @click="close">
            {{ isOwner ? 'Done' : 'Close' }}
          </v-btn>
          <v-btn
            v-if="isOwner"
            class="btn-add"
            elevation="0"
            :disabled="!shareEmail.trim() || shareLoading"
            :loading="shareLoading"
            @click="submitShareList"
          >
            Add
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
        <BaseTextarea
          v-model="editListDescription"
          label="Description (optional)"
          placeholder="Enter list description"
          :maxlength="250"
          counter
          :rows="3"
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

      <ConfirmDialog
        v-model="showPurchaseDialog"
        title="Mark as Purchased"
        message="Mark this list as purchased? This will save it to history."
        confirm-text="Mark as Purchased"
        variant="success"
        @confirm="confirmPurchase"
      />
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

.share-list-name {
  font-size: 1rem;
  font-weight: 600;
  color: #212121;
  margin: 0 0 1rem 0;
}

.shared-users-container {
  margin-top: 1rem;
}

.shared-users-container.no-input {
  margin-top: 0;
}

.shared-users-section {
  margin-bottom: 1rem;
}

.shared-users-section:last-child {
  margin-bottom: 0;
}

.section-subtitle {
  font-size: 0.75rem;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.5rem 0;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem;
  background-color: #f9f9f9;
  border-radius: 6px;
  margin-bottom: 0.375rem;
}

.user-item:last-child {
  margin-bottom: 0;
}

.user-icon {
  color: #999;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #212121;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-email {
  font-size: 0.75rem;
  color: #999;
  margin: 0.125rem 0 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-user-btn {
  color: #999 !important;
  opacity: 0.6;
  transition: all 0.2s ease;
}

.remove-user-btn:hover {
  color: #e53935 !important;
  opacity: 1;
}
</style>
