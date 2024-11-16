<template>
  <section class="topics-section">
    <div class="text-subtitle2 q-mb-sm">Sujets connexes</div>
    <q-list dense>
      <q-item v-for="(topic, index) in topics" :key="index" clickable v-ripple>
        <q-item-section>
          <q-item-label>{{ topic }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" color="primary" />
        </q-item-section>
      </q-item>
    </q-list>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  topics: string[]
}>()
</script>

<style lang="scss" scoped>
:deep(.q-list) {
  background: transparent;
  
  .q-item {
    min-height: 40px;
    color: var(--text-color);
    border-radius: 4px;
    
    &:hover {
      background: rgba(85, 199, 204, 0.1);
    }
  }
}
</style>