<template>
  <div class="indexation-cell">
    <template v-if="isIndexing">
      <q-circular-progress
        :value="progress"
        size="24px"
        color="primary"
        class="q-mr-xs"
        show-value
      />
    </template>
    <template v-else>
      <q-btn
        :color="value ? 'positive' : 'grey-7'"
        icon="pending_actions"
        flat
        round
        dense
        size="sm"
        class="indexation-btn"
        :disable="true"
      >
        <q-tooltip>
          <template v-if="value">
            Indexé en {{ executionTime }}s
          </template>
          <template v-else>
            Non indexé
          </template>
        </q-tooltip>
      </q-btn>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'

interface Props {
  value: boolean
  isIndexing?: boolean
  executionTime?: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'indexation-complete', time: number): void
}>()

const progress = ref(0)
const startTime = ref(0)
let progressInterval: number | null = null
let completionTimeout: number | null = null

const cleanup = () => {
  if (progressInterval !== null) {
    window.clearInterval(progressInterval)
    progressInterval = null
  }
  if (completionTimeout !== null) {
    window.clearTimeout(completionTimeout)
    completionTimeout = null
  }
}

const completeIndexation = () => {
  const endTime = performance.now()
  const duration = Number(((endTime - startTime.value) / 1000).toFixed(1))
  cleanup()
  emit('indexation-complete', duration)
}

const startIndexingAnimation = () => {
  cleanup()
  progress.value = 0
  startTime.value = performance.now()
  
  progressInterval = window.setInterval(() => {
    if (progress.value < 95) {
      const remaining = 95 - progress.value
      const increment = Math.max(0.5, remaining * 0.05)
      progress.value = Math.min(95, progress.value + increment)
    }
  }, 100)
  
  completionTimeout = window.setTimeout(() => {
    progress.value = 100
    setTimeout(completeIndexation, 200)
  }, 5000)
}

watch(() => props.isIndexing, (newVal) => {
  if (newVal) {
    startIndexingAnimation()
  } else {
    cleanup()
  }
}, { immediate: true })

onBeforeUnmount(cleanup)
</script>

<style lang="scss" scoped>
.indexation-cell {
  display: flex;
  align-items: center;
  justify-content: center;

  .indexation-btn {
    min-width: 22px;
    width: 22px;
    height: 22px;
    padding: 0;
    transition: opacity 0.2s ease;

    :deep(.q-icon) {
      font-size: 14px;
    }
    
    &:hover {
      opacity: 0.8;
    }
  }

  .q-circular-progress {
    font-size: 10px;
  }
}

@media (max-width: $breakpoint-xs) {
  .indexation-cell {
    .indexation-btn {
      min-width: 20px;
      width: 20px;
      height: 20px;

      :deep(.q-icon) {
        font-size: 12px;
      }
    }
  }
}
</style>