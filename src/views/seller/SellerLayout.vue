<template>
  <div :class="{ 'dark': $q.dark.isActive }" class="seller-shell transition-colors duration-300">
    <q-layout view="lHh Lpr lFf" class="seller-layout">
      <SellerSidebar />
      <q-page-container>
        <router-view />
      </q-page-container>
    </q-layout>
  </div>
</template>

<script setup>
import { useQuasar } from 'quasar';
import SellerSidebar from './SellerSidebar.vue';
import '@/assets/seller-dark-theme.css';
const $q = useQuasar();
</script>

<style scoped>
.seller-shell,
.seller-layout,
.seller-layout :deep(.q-page-container) {
  width: 100%;
  min-width: 0;
  max-width: 100%;
}

.seller-layout {
  overflow-x: clip;
}
</style>
