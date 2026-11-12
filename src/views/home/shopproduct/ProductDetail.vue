<template>
  <q-card style="max-width: 600px; width: 100%;">
    <q-card-section class="row items-center q-pb-none">
      <div class="col-4">
        <q-img :src="product.image" :alt="product.title" ratio="1" class="rounded" />
      </div>
      <div class="col-8 q-pl-md">
        <div class="text-h6">{{ product.title }}</div>
        <div class="text-subtitle2 text-gray-500 mb-2">{{ product.brand }}</div>
        <q-rating :model-value="product.rating" max="5" size="20px" color="amber" readonly />
        <div class="text-primary text-xl font-bold mt-2">{{ formatMoney(product.price) }}</div>
        <div class="text-sm text-gray-600 mt-2">{{ product.description }}</div>
        <div class="mt-2">
          <span class="font-medium">Variants:</span>
          <q-chip v-for="v in product.variants" :key="v" color="primary" text-color="white" dense>{{ v }}</q-chip>
        </div>
      </div>
    </q-card-section>
    <q-card-actions align="right">
      <q-btn
        flat
        :icon="inWishlist ? 'favorite' : 'favorite_border'"
        :color="inWishlist ? 'pink' : 'grey-6'"
        @click="$emit('toggle-wishlist', product.id)"
      />
      <q-btn
        flat
        icon="shopping_cart"
        :color="inCart ? 'primary' : 'grey-6'"
        @click="$emit('add-to-cart', product.id)"
      />
      <q-btn flat label="Close" color="primary" @click="$emit('close')" />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { formatMoney } from '@/utils/currency'

defineProps({
  product: Object,
  inCart: Boolean,
  inWishlist: Boolean
})
defineEmits(['add-to-cart', 'toggle-wishlist', 'close'])
</script>