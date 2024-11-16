<template>
  <q-tr :props="props" :class="{ 'cursor-pointer': true, selected: selected }">
    <q-td auto-width>
      <q-checkbox v-model="selected" />
    </q-td>
    <q-td key="name" :props="props">
      <div 
        class="text-primary cursor-pointer"
        @click="$emit('open-drawer', row)"
      >
        {{ row.name }}
      </div>
    </q-td>
    <q-td key="active" :props="props" class="text-center">
      <document-table-activation-cell
        v-model:value="row.active"
        @update:value="$emit('toggle-activation', row.id)"
      />
    </q-td>
    <q-td key="createdAt" :props="props" class="text-center">
      {{ formatDate(row.createdAt) }}
    </q-td>
    <q-td key="size" :props="props" class="text-right">
      {{ row.size }} Mo
    </q-td>
    <q-td key="pages" :props="props" class="text-right">
      {{ row.pages }}
    </q-td>
    <q-td key="tokens" :props="props" class="text-right">
      {{ formatNumber(row.tokens) }}
    </q-td>
    <q-td key="indexed" :props="props" class="text-center">
      <document-table-indexation-cell
        :value="row.indexed"
        :is-indexing="isIndexing"
        :execution-time="row.indexationTime"
        @indexation-complete="onIndexationComplete"
      />
    </q-td>
    <q-td key="actions" :props="props" class="text-center">
      <document-table-action-cell
        :row="row"
        @index="$emit('index', row)"
        @index-method="$emit('index-method', row)"
        @rename="$emit('rename', row)"
        @duplicate="$emit('duplicate', row)"
        @delete="$emit('delete', row)"
        @download="$emit('download', row)"
      />
    </q-td>
  </q-tr>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Document } from '@/types/document'
import DocumentTableActivationCell from '../cells/DocumentTableActivationCell.vue'
import DocumentTableIndexationCell from '../cells/DocumentTableIndexationCell.vue'
import DocumentTableActionCell from '../cells/DocumentTableActionCell.vue'

interface Props {
  row: Document
  props: any
  isSelected: boolean
  isIndexing: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:selected', value: boolean): void
  (e: 'toggle-activation', id: number): void
  (e: 'open-drawer', doc: Document): void
  (e: 'index', doc: Document): void
  (e: 'index-method', doc: Document): void
  (e: 'rename', doc: Document): void
  (e: 'duplicate', doc: Document): void
  (e: 'delete', doc: Document): void
  (e: 'download', doc: Document): void
  (e: 'indexation-complete', time: number): void
}>()

const selected = computed({
  get: () => props.isSelected,
  set: (value) => emit('update:selected', value)
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('fr-FR').format(num)
}

const onIndexationComplete = (time: number) => {
  emit('indexation-complete', time)
}
</script>

<style lang="scss" scoped>
.selected {
  background-color: var(--hover-color) !important;
}
</style>