<template>
  <q-card-section>
    <div class="row items-center no-wrap">
      <div class="col">
        <div class="row items-center q-gutter-x-sm">
          <q-checkbox
            :model-value="selected"
            color="primary"
            class="custom-checkbox"
            @update:model-value="$emit('update:selected', $event)"
          />
          <div 
            class="document-name text-primary cursor-pointer"
            @click="$emit('open-drawer')"
          >
            {{ name }}
          </div>
        </div>
      </div>
    </div>
  </q-card-section>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  selected: boolean
}>()

defineEmits<{
  (e: 'update:selected', value: boolean): void
  (e: 'open-drawer'): void
}>()
</script>

<style lang="scss" scoped>
.document-name {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(100% - 40px);
}

:deep(.custom-checkbox) {
  .q-checkbox__inner {
    color: var(--text-color) !important;
    
    &:before {
      border-color: var(--text-color) !important;
    }
  }
  
  &.q-checkbox--checked {
    .q-checkbox__inner {
      color: var(--primary-color) !important;
      
      &:before {
        border-color: var(--primary-color) !important;
      }
    }
  }
}

@media (max-width: $breakpoint-xs) {
  .document-name {
    font-size: 0.9rem;
  }
}
</style>