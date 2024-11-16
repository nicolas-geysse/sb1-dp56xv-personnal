<template>
  <base-dialog
    v-model="isOpen"
    title="Nouveau dossier"
    :actions="dialogActions"
    persistent
  >
    <q-input
      v-model="folderName"
      dark
      dense
      autofocus
      :error="!!error"
      :error-message="error"
      @keyup.enter="onSubmit"
      class="custom-input"
      placeholder="Nom du dossier"
    />
  </base-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseDialog from '@/components/base/BaseDialog.vue'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'create', name: string): void
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const folderName = ref('')
const error = ref('')

const dialogActions = computed(() => [
  {
    label: 'Annuler',
    color: 'grey-7',
    flat: true,
    onClick: () => {
      isOpen.value = false
      folderName.value = ''
      error.value = ''
    }
  },
  {
    label: 'Créer',
    color: 'primary',
    flat: true,
    disable: !!error.value || !folderName.value,
    onClick: onSubmit
  }
])

const validateFolderName = (name: string) => {
  if (!name.trim()) {
    return 'Le nom du dossier ne peut pas être vide'
  }
  if (name.includes('/') || name.includes('\\')) {
    return 'Le nom du dossier ne peut pas contenir de caractères spéciaux'
  }
  return ''
}

const onSubmit = () => {
  const validationError = validateFolderName(folderName.value)
  if (validationError) {
    error.value = validationError
    return
  }

  emit('create', folderName.value)
  folderName.value = ''
  error.value = ''
  isOpen.value = false
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