<template>
  <q-layout view="hHh lpR fFf">
    <app-header :title="title" />
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from '../components/common/AppHeader.vue'

const title = ref('Gestion documentaire')
</script>

<style lang="scss" scoped>
.q-page-container {
  padding-top: 56px;
  background-color: var(--background-color);
}

@media (max-width: 599px) {
  .q-page-container {
    padding-top: 50px;
  }
}
</style>