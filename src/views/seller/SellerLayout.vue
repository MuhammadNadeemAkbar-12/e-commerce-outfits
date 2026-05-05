<template>
  <div :class="{ 'dark': $q.dark.isActive }" class="transition-colors duration-300">
    <q-layout view="lHh Lpr lFf">
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