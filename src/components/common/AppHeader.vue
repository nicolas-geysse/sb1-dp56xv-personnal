<template>
  <q-header elevated class="app-header">
    <q-toolbar>
      <q-toolbar-title>
        {{ title }}
      </q-toolbar-title>
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<style lang="scss" scoped>
.app-header {
  .q-toolbar {
    min-height: var(--header-height);
    padding: 0 16px;
  }

  .q-toolbar-title {
    font-size: 1.25rem;
    font-weight: 500;
    color: var(--text-color);
  }
}

@media (max-width: $breakpoint-xs) {
  .app-header {
    .q-toolbar {
      min-height: var(--header-height-mobile);
      padding: 0 12px;
    }

    .q-toolbar-title {
      font-size: 1.125rem;
    }
  }
}
</style>