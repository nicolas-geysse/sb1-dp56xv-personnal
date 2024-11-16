<template>
  <div class="metadata-field">
    <div class="label">{{ label }}</div>
    <div class="value">
      <slot>{{ value }}</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value?: string
}>()
</script>

<style lang="scss" scoped>
.metadata-field {
  margin-bottom: 12px;

  .label {
    color: var(--text-secondary);
    font-size: 0.875rem;
    margin-bottom: 4px;
  }

  .value {
    font-weight: 500;
  }
}

@media (max-width: $breakpoint-xs) {
  .metadata-field {
    .label {
      font-size: 0.8rem;
    }
    .value {
      font-size: 0.9rem;
    }
  }
}
</style>