<template>
  <div class="breadcrumb-container">
    <q-breadcrumbs separator="/" class="text-grey-5">
      <q-breadcrumbs-el
        v-for="node in path"
        :key="node.id"
        :label="node.name"
        :class="{
          'cursor-pointer': true,
          'text-primary': node.id === currentNode.id
        }"
        @click="$emit('navigate', node)"
      />
    </q-breadcrumbs>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PathNode } from '@/types/navigation'

const props = defineProps<{
  path: PathNode[]
}>()

defineEmits<{
  (e: 'navigate', node: PathNode): void
}>()

const currentNode = computed(() => {
  return props.path[props.path.length - 1]
})
</script>

<style lang="scss" scoped>
.breadcrumb-container {
  :deep(.q-breadcrumbs) {
    font-size: 0.9rem;
  }

  :deep(.q-breadcrumbs__el) {
    &:hover {
      color: var(--primary-color);
    }
  }
}
</style>