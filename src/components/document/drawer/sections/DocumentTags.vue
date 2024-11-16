<template>
  <section class="tags-section">
    <div class="text-subtitle2 q-mb-sm">Mots-clés</div>
    <div class="row q-col-gutter-sm">
      <div v-for="(tag, index) in tags" :key="index" class="col-auto">
        <q-chip
          dense
          color="primary"
          text-color="white"
          class="tag-chip"
        >
          {{ tag }}
        </q-chip>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  tags: string[]
}>()
</script>

<style lang="scss" scoped>
.tag-chip {
  background-color: rgba(85, 199, 204, 0.2);
  color: var(--primary-color);
  font-weight: 500;
}

@media (max-width: $breakpoint-xs) {
  .tag-chip {
    font-size: 0.8rem;
  }
}
</style>