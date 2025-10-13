<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import NavBar from '@/components/NavBar.vue'
import SearchDropdown from '@/components/SearchDropdown.vue'
import { usePurchasesStore } from '@/stores/purchases'
import { useNotification } from '@/composables/useNotification'

const purchasesStore = usePurchasesStore()
const { purchases, loading } = storeToRefs(purchasesStore)
const { showSuccess, showError } = useNotification()

const searchQuery = ref('')

const sortedPurchases = computed(() => {
  return [...purchases.value].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return dateB - dateA
  })
})

const filteredPurchases = computed(() => {
  if (!searchQuery.value) return sortedPurchases.value
  return sortedPurchases.value.filter((purchase) =>
    purchase.list.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

function handleSearchInput(value: string) {
  searchQuery.value = value
}

async function handleRestorePurchase(purchaseId: number) {
  if (confirm('Restore this purchase as a new shopping list?')) {
    try {
      await purchasesStore.restorePurchase(purchaseId)
      showSuccess('Purchase restored successfully!')
    } catch {
      showError('Failed to restore purchase')
    }
  }
}

onMounted(() => {
  purchasesStore.fetchPurchases()
})
</script>

<template>
  <NavBar />
  <div class="purchases-view">
    <v-container class="py-8">
      <h1 class="page-title">Purchase History</h1>

      <div v-if="!loading" class="search-row mb-10">
        <SearchDropdown
          v-model="searchQuery"
          placeholder="Search purchases..."
          :show-dropdown="false"
          @update:model-value="handleSearchInput"
        />
      </div>

      <div v-if="loading" class="text-center py-16">
        <v-progress-circular indeterminate color="primary" size="64" class="mb-4" />
        <p class="text-h6 text-medium-emphasis">Loading purchase history...</p>
      </div>

      <div v-else-if="filteredPurchases.length === 0 && !searchQuery" class="text-center py-16">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-history</v-icon>
        <p class="text-h6 text-medium-emphasis">No purchase history</p>
        <p class="text-body-2 text-medium-emphasis">Your completed purchases will appear here</p>
      </div>

      <div v-else-if="filteredPurchases.length === 0 && searchQuery" class="text-center py-16">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-magnify</v-icon>
        <p class="text-h6 text-medium-emphasis">No purchases match your search</p>
        <p class="text-body-2 text-medium-emphasis mb-4">Try a different search term</p>
      </div>

      <div
        v-else
        class="purchases-grid"
        style="max-width: 900px; margin-left: auto; margin-right: auto"
      >
        <div v-for="purchase in filteredPurchases" :key="purchase.id" class="purchase-card">
          <div class="purchase-card-content">
            <div class="purchase-card-info">
              <div class="purchase-card-title-row">
                <h3 class="purchase-card-title">{{ purchase.list.name }}</h3>
              </div>
              <p v-if="purchase.list.description" class="purchase-card-description">
                {{ purchase.list.description }}
              </p>
              <p class="purchase-card-subtitle">
                {{ purchase.items?.length || 0 }} items • Purchased on
                {{ new Date(purchase.createdAt || '').toLocaleDateString() }}
              </p>
            </div>

            <v-menu :close-on-content-click="false" location="bottom end" offset="8">
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
                    @click="handleRestorePurchase(purchase.id)"
                    class="menu-item"
                    rounded="lg"
                  >
                    <template v-slot:prepend>
                      <v-icon icon="mdi-restore" size="20" class="menu-icon" />
                    </template>
                    <v-list-item-title class="menu-text">Restore</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-menu>
          </div>
        </div>
      </div>
    </v-container>
  </div>
</template>

<style scoped>
.purchases-view {
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

.purchases-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.purchase-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.purchase-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.purchase-card-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.purchase-card-info {
  flex: 1;
}

.purchase-card-title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.purchase-card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #000;
  margin: 0;
}

.purchase-card-description {
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

.purchase-card-subtitle {
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

.menu-item:hover .menu-icon {
  color: #424242;
}

.menu-text {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #212121;
  letter-spacing: -0.01em;
}

.menu-divider {
  margin: 0;
  border-color: rgba(0, 0, 0, 0.08);
}
</style>
