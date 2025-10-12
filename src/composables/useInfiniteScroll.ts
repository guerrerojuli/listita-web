import { nextTick, onUnmounted, type Ref } from 'vue'

interface UseInfiniteScrollOptions {
  /**
   * The element ref that triggers loading more items when it becomes visible
   */
  trigger: Ref<HTMLElement | null>
  /**
   * Reactive boolean indicating if there are more items to load
   */
  hasMore: Ref<boolean>
  /**
   * Reactive boolean indicating if items are currently being loaded
   */
  loadingMore: Ref<boolean>
  /**
   * Callback function to execute when more items should be loaded
   */
  onLoadMore: () => void | Promise<void>
  /**
   * IntersectionObserver threshold (default: 1.0)
   * - 0.0: Load when any part of trigger is visible
   * - 1.0: Load when trigger is fully visible
   */
  threshold?: number
  /**
   * IntersectionObserver rootMargin (default: '100px')
   * Positive values start loading before the trigger is visible
   */
  rootMargin?: string
}

/**
 * Composable for implementing infinite scroll with IntersectionObserver
 *
 * @example
 * ```ts
 * const loadMoreTrigger = ref<HTMLElement | null>(null)
 * const { hasMore, loadingMore } = storeToRefs(store)
 *
 * const { setupObserver } = useInfiniteScroll({
 *   trigger: loadMoreTrigger,
 *   hasMore,
 *   loadingMore,
 *   onLoadMore: () => store.loadMore()
 * })
 *
 * onMounted(() => {
 *   setupObserver()
 * })
 * ```
 */
export function useInfiniteScroll(options: UseInfiniteScrollOptions) {
  const {
    trigger,
    hasMore,
    loadingMore,
    onLoadMore,
    threshold = 1.0,
    rootMargin = '100px',
  } = options

  let observer: IntersectionObserver | null = null

  /**
   * Sets up the IntersectionObserver to watch the trigger element
   * Call this after the trigger element is mounted and data is loaded
   */
  function setupObserver() {
    if (observer) {
      observer.disconnect()
    }

    nextTick(() => {
      if (trigger.value) {
        observer = new IntersectionObserver(
          (entries) => {
            const entry = entries[0]
            if (entry.isIntersecting && hasMore.value && !loadingMore.value) {
              onLoadMore()
            }
          },
          {
            threshold,
            rootMargin,
          },
        )

        observer.observe(trigger.value)
      }
    })
  }

  /**
   * Manually disconnect the observer
   * Usually not needed as cleanup happens automatically on unmount
   */
  function disconnect() {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    setupObserver,
    disconnect,
  }
}
