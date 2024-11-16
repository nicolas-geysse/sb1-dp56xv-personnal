<template>
  <q-dialog
    v-model="isOpen"
    persistent
    class="custom-dialog"
  >
    <q-card dark style="min-width: 375px">
      <q-card-section class="row items-center">
        <div class="text-h6">Renommer le document</div>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="newName"
          dark
          dense
          autofocus
          class="custom-input"
          :error="!!error"
          :error-message="error"
          @keyup.enter="onSubmit"
        />
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn
          flat
          label="Annuler"
          color="grey-7"
          v-close-popup
        />
        <q-btn
          flat
          label="Renommer"
          color="primary"
          @click="onSubmit"
          :disable="!!error || !newName"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
    modelValue: boolean
    currentName: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'rename', newName: string): void
}>()

const isOpen = ref(props.modelValue)
const newName = ref(props.currentName)
const error = ref('')

watch(() => props.modelValue, (val) => {
    isOpen.value = val
    if (val) {
        newName.value = props.currentName
        error.value = ''
    }
})

watch(isOpen, (val) => {
    emit('update:modelValue', val)
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
.q-card {
    background-color: var(--background-color);
}

.text-h6 {
    color: var(--text-color);
    font-size: 1.25rem;
    font-weight: 500;
}

.q-card-actions {
    .q-btn {
        min-width: 100px;
    }
}

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