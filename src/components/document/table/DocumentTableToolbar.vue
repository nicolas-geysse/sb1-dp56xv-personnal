<template>
  <div class="toolbar-container q-px-md">
    <!-- Actions Row -->
    <div class="row q-col-gutter-md items-center">
      <div class="col">
        <div class="row q-col-gutter-md items-center">
          <transition-group 
            name="bulk-action"
            class="row q-col-gutter-md items-center"
            tag="div"
          >
            <template v-if="selectedCount > 0">
              <div :class="actionButtonClass" key="index">
                <q-btn
                  class="bulk-action-btn"
                  icon="pending_actions"
                  :label="`Indexer (${selectedCount})`"
                  @click="$emit('index-selected')"
                />
              </div>
              <div :class="actionButtonClass" key="duplicate">
                <q-btn
                  class="bulk-action-btn"
                  icon="file_copy"
                  :label="`Dupliquer (${selectedCount})`"
                  @click="$emit('duplicate-selected')"
                />
              </div>
              <div :class="actionButtonClass" key="download">
                <q-btn
                  class="bulk-action-btn"
                  icon="download"
                  :label="`Télécharger (${selectedCount})`"
                  @click="$emit('download-selected')"
                />
              </div>
              <div :class="actionButtonClass" key="delete">
                <q-btn
                  color="negative"
                  icon="delete"
                  :label="`Supprimer (${selectedCount})`"
                  @click="$emit('delete-selected')"
                />
              </div>
            </template>
          </transition-group>
        </div>
      </div>
      <div class="col-auto">
        <q-btn 
          color="primary" 
          icon="add"
          label="Nouveau"
          @click="$emit('add')"
        />
      </div>
    </div>

    <!-- Search Row -->
    <div class="row q-mt-md">
      <div class="search-wrapper">
        <q-input
          v-model="searchModel"
          dark
          outlined
          dense
          debounce="300"
          label="Rechercher"
          class="search-input"
          bg-color="#374151"
          @update:model-value="onSearchUpdate"
        >
          <template v-slot:append>
            <q-icon name="search" color="primary" />
          </template>
        </q-input>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  filter: string
  isMobile?: boolean
  selectedCount: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:filter', value: string): void
  (e: 'add'): void
  (e: 'index-selected'): void
  (e: 'duplicate-selected'): void
  (e: 'download-selected'): void
  (e: 'delete-selected'): void
}>()

const searchModel = ref(props.filter)

const actionButtonClass = computed(() => 
  props.isMobile ? 'col-12' : 'col-auto'
)

const onSearchUpdate = (value: string) => {
  emit('update:filter', value)
}
</script>

<style lang="scss" scoped>
.toolbar-container {
  width: 100%;
  padding-bottom: 0;
}

.search-wrapper {
  width: var(--card-min-width);
}

.q-btn {
  min-width: 130px;
  height: 38px;
}

.bulk-action-btn {
  background-color: #35494D;
  color: var(--text-color);
  transition: background-color 0.3s ease;

  &:hover {
    background-color: var(--primary-color);
  }
}

.search-input {
  :deep(.q-field__control) {
    background-color: #374151;
    border: 1px solid var(--primary-color);
    transition: border-color 0.3s ease;
  }

  :deep(.q-field__label) {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  :deep(.q-field__native) {
    color: var(--text-color);
    padding: 8px 0;
  }

  :deep(.q-field__marginal) {
    height: 40px;
  }
}

// Transitions pour les boutons d'action en bulk
.bulk-action-enter-active,
.bulk-action-leave-active {
  transition: all 0.3s ease;
}

.bulk-action-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.bulk-action-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.bulk-action-move {
  transition: transform 0.3s ease;
}

@media (max-width: $breakpoint-xs) {
  .q-btn {
    width: 100%;
    margin-bottom: 8px;
  }
}
</style>