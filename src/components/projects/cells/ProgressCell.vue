<template>
  <div class="progress-cell">
    <q-linear-progress
      :value="normalizedValue"
      :color="progressColor"
      size="md"
      rounded
      class="progress-bar"
    />
    <div class="text-caption q-mt-xs">
      {{ value }}%
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  value: number
}>()

const normalizedValue = computed(() => props.value / 100)

const progressColor = computed(() => {
  if (props.value < 30) return 'negative'
  if (props.value < 70) return 'warning'
  return 'positive'
})
</script>

<style lang="scss" scoped>
.progress-cell {
  min-width: 80px;
  max-width: 150px;
  margin: 0 auto;
  padding: 0 8px;

  .progress-bar {
    transition: all 0.3s ease;
  }

  .text-caption {
    text-align: center;
    color: var(--text-secondary);
  }
}

@media (max-width: 599px) {
  .progress-cell {
    min-width: 60px;
    padding: 0 4px;

    .text-caption {
      font-size: 0.8rem;
    }
  }
}
</style>