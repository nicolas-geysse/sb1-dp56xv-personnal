<template>
  <div class="document-card-field">
    <div class="row items-center justify-between q-gutter-x-sm">
      <div class="text-caption">{{ label }}</div>
      <div class="field-value">
        <slot>{{ value }}</slot>
      </div>
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
.document-card-field {
  .text-caption {
    color: var(--text-secondary);
  }

  .field-value {
    font-weight: 500;
  }
}

@media (max-width: $breakpoint-xs) {
  .document-card-field {
    .text-caption {
      font-size: 0.8rem;
    }
    .field-value {
      font-size: 0.9rem;
    }
  }
}
</style>