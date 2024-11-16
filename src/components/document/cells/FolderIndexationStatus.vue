<template>
  <div class="folder-indexation-status">
    <template v-if="isIndexing">
      <div class="indexing-container">
        <q-circular-progress
          :value="progress"
          size="32px"
          color="primary"
          class="q-mr-xs"
          show-value
        />
        <div class="indexing-info text-caption">
          {{ currentFile }}/{{ totalFiles }}
        </div>
      </div>
    </template>
    <template v-else>
      <q-btn
        flat
        round
        dense
        :color="statusColor"
        :icon="iconName"
        class="folder-status-btn"
        :disable="!canIndex"
        @click="$emit('index')"
      >
        <q-tooltip>{{ tooltipText }}</q-tooltip>
      </q-btn>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import type { FolderStatistics } from '@/types/document'

interface Props {
  statistics: FolderStatistics
  isIndexing?: boolean
  currentFile?: number
  totalFiles?: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'index'): void
}>()

const progress = ref(0)
let progressInterval: number | null = null

const iconName = computed(() => 'pending_actions')

const statusColor = computed(() => {
  if (props.isIndexing) return 'primary'
  
  const { indexedCount, totalCount } = props.statistics
  if (totalCount === 0) return 'grey-7'
  if (indexedCount === 0) return 'grey-7'
  if (indexedCount < totalCount) return 'warning'
  return 'positive'
})

const canIndex = computed(() => {
  const { indexedCount, totalCount } = props.statistics
  return totalCount > 0 && indexedCount < totalCount
})

const tooltipText = computed(() => {
  if (props.isIndexing) {
    return `Indexation en cours (${props.currentFile}/${props.totalFiles})`
  }

  const { indexedCount, totalCount } = props.statistics
  if (totalCount === 0) {
    return 'Dossier vide'
  }
  if (indexedCount === 0) {
    return 'Aucun document indexé'
  }
  if (indexedCount < totalCount) {
    return `${indexedCount}/${totalCount} documents indexés`
  }
  return 'Tous les documents sont indexés'
})

const cleanup = () => {
  if (progressInterval !== null) {
    window.clearInterval(progressInterval)
    progressInterval = null
  }
}

const startIndexingAnimation = () => {
  cleanup()
  progress.value = 0
  
  progressInterval = window.setInterval(() => {
    if (progress.value < 95) {
      const remaining = 95 - progress.value
      const increment = Math.max(0.5, remaining * 0.05)
      progress.value = Math.min(95, progress.value + increment)
    }
  }, 100)
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
.folder-indexation-status {
  display: flex;
  align-items: center;
  justify-content: center;

  .indexing-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .indexing-info {
    color: var(--text-color);
    font-size: 0.8rem;
  }

  .folder-status-btn {
    min-width: 32px;
    width: 32px;
    height: 32px;
    font-size: 24px;
    opacity: 0.9;
    transition: all 0.2s ease;
    
    &:hover:not(:disabled) {
      opacity: 1;
      transform: scale(1.1);
    }

    &:disabled {
      opacity: 0.5;
    }

    :deep(.q-icon) {
      font-size: 24px;
    }
  }

  .q-circular-progress {
    font-size: 12px;
  }
}
</style>