<template>
  <base-dialog
    v-model="isOpen"
    title="Renommer le document"
    :actions="dialogActions"
    persistent
  >
    <q-input
      v-model="newName"
      dark
      dense
      autofocus
      :error="!!error"
      :error-message="error"
      @keyup.enter="onSubmit"
      class="custom-input"
    />
  </base-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import BaseDialog from '@/components/base/BaseDialog.vue'

interface Props {
  modelValue: boolean
  currentName: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'rename', newName: string): void
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const newName = ref(props.currentName)
const error = ref('')

const dialogActions = computed(() => [
  {
    label: 'Annuler',
    color: 'grey-7',
    flat: true,
    onClick: () => (isOpen.value = false)
  },
  {
    label: 'Renommer',
    color: 'primary',
    flat: true,
    disable: !!error.value || !newName.value,
    onClick: onSubmit
  }
])

watch(() => props.modelValue, (val) => {
  if (val) {
    newName.value = props.currentName
    error.value = ''
  }
})

const getFileExtension = (filename: string) => {
  return filename.slice(filename.lastIndexOf('.'))
}

const validateNewName = (name: string) => {
  if (!name.trim()) {
    return 'Le nom du fichier ne peut pas être vide'
  }
  
  const currentExt = getFileExtension(props.currentName)
  if (!name.endsWith(currentExt)) {
    return `Le fichier doit conserver l'extension "${currentExt}"`
  }
  
  return ''
}

watch(newName, (val) => {
  error.value = validateNewName(val)
})

const onSubmit = () => {
  if (!error.value && newName.value) {
    emit('rename', newName.value)
    isOpen.value = false
  }
}
</script>

<style lang="scss" scoped>
:deep(.custom-input) {
  .q-field__control {
    background-color: #374151;
    border: 1px solid var(--primary-color);
  }

  .q-field__native {
    color: var(--text-color);
  }

  .q-field__label {
    color: var(--text-secondary);
  }
}
</style>