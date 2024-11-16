<template>
  <transition-group 
    name="bulk-action"
    class="row q-col-gutter-md items-center"
    tag="div"
  >
    <template v-if="count > 0">
      <div :class="buttonClass" key="index">
        <q-btn
          class="bulk-action-btn"
          icon="pending_actions"
          :label="`Indexer (${count})`"
          @click="$emit('index')"
        />
      </div>
      <div :class="buttonClass" key="duplicate">
        <q-btn
          class="bulk-action-btn"
          icon="file_copy"
          :label="`Dupliquer (${count})`"
          @click="$emit('duplicate')"
        />
      </div>
      <div :class="buttonClass" key="download">
        <q-btn
          class="bulk-action-btn"
          icon="download"
          :label="`Télécharger (${count})`"
          @click="$emit('download')"
        />
      </div>
      <div :class="buttonClass" key="delete">
        <q-btn
          color="negative"
          icon="delete"
          :label="`Supprimer (${count})`"
          @click="$emit('delete')"
        />
      </div>
    </template>
  </transition-group>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  count: number
  isMobile: boolean
}

const props = defineProps<Props>()

defineEmits<{
  (e: 'index'): void
  (e: 'duplicate'): void
  (e: 'download'): void
  (e: 'delete'): void
}>()

const buttonClass = computed(() => 
  props.isMobile ? 'col-12' : 'col-auto'
)
</script>

<style lang="scss" scoped>
.bulk-action-btn {
  background-color: #35494D;
  color: var(--text-color);
  transition: background-color 0.3s ease;
  min-width: 130px;
  height: 38px;

  &:hover {
    background-color: var(--primary-color);
  }
}

// Transitions
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
  .bulk-action-btn {
    width: 100%;
    margin-bottom: 8px;
  }
}
</style>