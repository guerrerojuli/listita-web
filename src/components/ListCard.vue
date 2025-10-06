<script setup lang="ts">
import { computed } from 'vue'
import type { ShoppingList } from '@/types/list'

interface Props {
  list: ShoppingList
  isHighlighted?: boolean
}

interface Emits {
  (e: 'menu-click'): void
  (e: 'click'): void
}

const props = withDefaults(defineProps<Props>(), {
  isHighlighted: false,
})

const emit = defineEmits<Emits>()

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
</script>

<template>
  <div class="list-card" @click="emit('click')">
    <div class="list-card-content">
      <div class="list-card-info">
        <h3 class="list-card-title">{{ list.name }}</h3>
        <p class="list-card-subtitle">{{ subtitle }}</p>
      </div>

      <v-btn
        icon="mdi-dots-vertical"
        variant="text"
        size="small"
        @click.stop="emit('menu-click')"
      />
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
</style>
