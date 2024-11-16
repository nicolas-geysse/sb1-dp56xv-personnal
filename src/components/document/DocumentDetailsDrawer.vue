<template>
  <q-drawer
    v-model="isOpen"
    side="right"
    bordered
    :width="600"
    :breakpoint="700"
    dark
    class="document-drawer"
  >
    <template v-if="document">
      <div class="drawer-header q-pa-md">
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6">{{ document.name }}</div>
          <q-btn
            flat
            round
            dense
            icon="close"
            @click="isOpen = false"
          />
        </div>
        <q-separator dark />
      </div>

      <q-scroll-area class="drawer-content">
        <div class="q-pa-md">
          <!-- Preview Section -->
          <div class="preview-section q-mb-lg">
            <div class="text-subtitle2 q-mb-sm">Aperçu</div>
            <div class="preview-placeholder">
              <q-skeleton type="rect" height="300px" />
            </div>
          </div>

          <!-- Metadata Section -->
          <div class="metadata-section q-mb-lg">
            <div class="text-subtitle2 q-mb-sm">Informations</div>
            <div class="row q-col-gutter-md">
              <div class="col-6">
                <div class="metadata-item">
                  <div class="label">Créé le</div>
                  <div class="value">{{ formatDate(document.createdAt) }}</div>
                </div>
              </div>
              <div class="col-6">
                <div class="metadata-item">
                  <div class="label">Taille</div>
                  <div class="value">{{ document.size }} Mo</div>
                </div>
              </div>
              <div class="col-6">
                <div class="metadata-item">
                  <div class="label">Pages</div>
                  <div class="value">{{ document.pages }}</div>
                </div>
              </div>
              <div class="col-6">
                <div class="metadata-item">
                  <div class="label">Tokens</div>
                  <div class="value">{{ formatNumber(document.tokens) }}</div>
                </div>
              </div>
              <div class="col-12">
                <div class="metadata-item">
                  <div class="label">Statut d'indexation</div>
                  <div class="value">
                    <document-indexation-cell 
                      :value="document.indexed"
                      :execution-time="document.indexationTime"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tags Section -->
          <div class="tags-section q-mb-lg">
            <div class="text-subtitle2 q-mb-sm">Mots-clés</div>
            <div class="row q-col-gutter-sm">
              <div v-for="(tag, index) in mockTags" :key="index" class="col-auto">
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
          </div>

          <!-- Related Topics -->
          <div class="topics-section">
            <div class="text-subtitle2 q-mb-sm">Sujets connexes</div>
            <q-list dense>
              <q-item v-for="(topic, index) in mockTopics" :key="index" clickable v-ripple>
                <q-item-section>
                  <q-item-label>{{ topic }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" color="primary" />
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>
      </q-scroll-area>
    </template>
  </q-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Document } from '@/types/document'
import DocumentIndexationCell from './cells/DocumentIndexationCell.vue'

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

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('fr-FR').format(num)
}

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
.document-drawer {
  background-color: var(--background-color);
}

.drawer-header {
  position: sticky;
  top: 0;
  background-color: var(--background-color);
  z-index: 1;

  .text-h6 {
    font-size: 1.25rem;
    font-weight: 500;
  }
}

.drawer-content {
  height: calc(100vh - 73px);
}

.metadata-item {
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

.preview-placeholder {
  border-radius: 8px;
  overflow: hidden;
}

.tag-chip {
  background-color: rgba(85, 199, 204, 0.2);
  color: var(--primary-color);
  font-weight: 500;
}

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

@media (max-width: $breakpoint-xs) {
  .drawer-content {
    height: calc(100vh - 56px);
  }

  .metadata-item {
    .label {
      font-size: 0.8rem;
    }
    .value {
      font-size: 0.9rem;
    }
  }

  .tag-chip {
    font-size: 0.8rem;
  }
}
</style>