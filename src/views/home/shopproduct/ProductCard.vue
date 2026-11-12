<template>
  <q-card class="h-full flex flex-col cursor-pointer hover:shadow-lg transition" @click="$emit('view-detail', product)">
    <q-img :src="product.image" :alt="product.title" ratio="4/3" class="rounded-t" />
    <q-card-section class="flex-1 flex flex-col justify-between">
      <div>
        <div class="font-semibold text-lg truncate">{{ product.title }}</div>
        <div class="text-gray-500 text-sm mb-2">{{ product.brand }}</div>
        <div class="flex items-center gap-2">
          <q-rating :model-value="product.rating" max="5" size="18px" color="amber" readonly />
          <span class="text-xs text-gray-400">({{ product.reviews }})</span>
        </div>
      </div>
      <div class="flex items-center justify-between mt-3">
        <div class="font-bold text-xl text-primary">{{ formatMoney(product.price) }}</div>
        <div class="flex gap-2">
          <q-btn
            dense
            round
            flat
            :icon="inWishlist ? 'favorite' : 'favorite_border'"
            :color="inWishlist ? 'pink' : 'grey-6'"
            @click.stop="$emit('toggle-wishlist', product.id)"
          />
          <q-btn
            dense
            round
            flat
            icon="shopping_cart"
            :color="inCart ? 'primary' : 'grey-6'"
            @click.stop="$emit('add-to-cart', product.id)"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { formatMoney } from '@/utils/currency'

defineProps({
  product: Object,
  inCart: Boolean,
  inWishlist: Boolean
})
defineEmits(['add-to-cart', 'toggle-wishlist', 'view-detail'])
</script>