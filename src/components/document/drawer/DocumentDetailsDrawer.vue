<template>
  <base-drawer
    v-model="isOpen"
    :width="600"
    :breakpoint="700"
  >
    <template v-if="document">
      <drawer-header
        :title="document.name"
        @close="isOpen = false"
      />

      <q-scroll-area class="drawer-content">
        <div class="q-pa-md">
          <document-preview class="q-mb-lg" />
          <document-metadata
            :document="document"
            class="q-mb-lg"
          />
          <document-tags
            :tags="mockTags"
            class="q-mb-lg"
          />
          <document-topics
            :topics="mockTopics"
          />
        </div>
      </q-scroll-area>
    </template>
  </base-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Document } from '@/types/document'
import BaseDrawer from '@/components/base/BaseDrawer.vue'
import DrawerHeader from './DrawerHeader.vue'
import DocumentPreview from './sections/DocumentPreview.vue'
import DocumentMetadata from './sections/DocumentMetadata.vue'
import DocumentTags from './sections/DocumentTags.vue'
import DocumentTopics from './sections/DocumentTopics.vue'

interface Props {
  modelValue: boolean
  document: Document | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Mock data pour la démo
const mockTags = [
  'Documentation',
  'Technique',
  'Procédure',
  'Guide',
  'Reference',
  'API',
  'Développement'
]

const mockTopics = [
  'Architecture système',
  'Sécurité des données',
  'Performance',
  'Intégration continue',
  'Tests automatisés'
]
</script>

<style lang="scss" scoped>
.drawer-content {
  height: calc(100vh - 73px);
}

@media (max-width: $breakpoint-xs) {
  .drawer-content {
    height: calc(100vh - 56px);
  }
}
</style>