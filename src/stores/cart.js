import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import customerApi from '@/services/customerApi'
import { useAuthStore } from '@/stores/auth'

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref([])
  const isInitialized = ref(false)
  // tick to force reactivity if needed
  const changeTick = ref(0)

  // initialize auth store early so actions can use it
  const authStore = useAuthStore()

  const debugLog = () => {}


  // LocalStorage helpers for fallback (guests only)
  const CART_KEY = 'stylehub_cart_items';
  const loadCartFromStorage = () => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) {
        items.value = JSON.parse(raw);
        isInitialized.value = true;
        debugLog('Loaded cart from localStorage', items.value);
      }
    } catch (e) {
      debugLog('Failed to load cart from localStorage', e);
    }
  };
  const saveCartToStorage = () => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items.value));
      debugLog('Saved cart to localStorage', items.value);
    } catch (e) {
      debugLog('Failed to save cart to localStorage', e);
    }
  };
  const manualSave = () => {
    saveCartToStorage();
    debugLog('Manual save triggered (localStorage)');
  }

  // Load cart on store initialization
  try {
    // If authenticated, prefer server canonical cart and fetch it to sync.
    // For guests, load from localStorage.
    if (authStore.checkAuth && authStore.checkAuth() && ['customer', 'buyer'].includes(authStore.role)) {
      debugLog('User authenticated at init, fetching remote cart to sync')
      fetchRemoteCart().catch(e => debugLog('fetchRemoteCart init failed', e))
    } else {
      items.value = []
      isInitialized.value = true
      debugLog('Guest session: cart starts empty in-memory')
    }
  } catch (e) {
    // fallback to local load
    loadCartFromStorage()
  }

  // Watch for changes and automatically persist to localStorage
  watch(items, (newItems) => {
    if (isInitialized.value) {
      debugLog('Cart items changed (in-memory):', newItems)
    }
  }, { deep: true })

  // Getters
  const cartItems = computed(() => {
    debugLog('Getting cart items:', items.value)
    return items.value
  })

  const totalItems = computed(() => {
    const sanitizeNumber = (raw) => {
      if (raw == null) return 0
      const s = String(raw).replace(/[^0-9.-]+/g, '')
      const n = Number(s)
      return isFinite(n) ? n : 0
    }
    const total = items.value.reduce((acc, item) => acc + sanitizeNumber(item.quantity), 0)
    debugLog('Calculating total items:', total)
    return total
  })

  const totalPrice = computed(() => {
    const sanitizeNumber = (raw) => {
      if (raw == null) return 0
      const s = String(raw).replace(/[^0-9.-]+/g, '')
      const n = Number(s)
      return isFinite(n) ? n : 0
    }
    const total = items.value.reduce((acc, item) => {
      const price = sanitizeNumber(item.price)
      const qty = sanitizeNumber(item.quantity)
      return acc + price * qty
    }, 0)
    debugLog('Calculating total price:', total)
    return total
  })

  const itemCount = computed(() => {
    const count = items.value.length
    debugLog('Calculating item count:', count)
    return count
  })

  // Check if product is in cart
  const isInCart = (productId) => {
    const inCart = items.value.some(item => item.id === productId || item.product_id === productId)
    debugLog(`Checking if product ${productId} is in cart:`, inCart)
    return inCart
  }

  // Actions
  // Track pending operations to avoid duplicate requests (double-add/double-remove)
  const pendingAdds = new Set()
  const pendingRemoves = new Set()

  // product: { id, title, price, image, brand, quantity }
  // options: { suppressBackgroundSync: boolean }
  const addToCart = (product, options = {}) => {
    debugLog('Adding product to cart:', product)

    if (!product || !product.id) {
      console.error('Invalid product provided to addToCart:', product)
      return
    }

    // Create a new array to ensure reactivity
    const currentItems = [...items.value]
    const existingItemIndex = currentItems.findIndex(item => item.id === product.id)

    if (existingItemIndex !== -1) {
      // Update existing item - create new object to ensure reactivity
      currentItems[existingItemIndex] = {
        ...currentItems[existingItemIndex],
        quantity: currentItems[existingItemIndex].quantity + 1
      }
      debugLog('Updated existing item quantity:', currentItems[existingItemIndex].quantity)
    } else {
      // Add new item
      const newItem = {
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        brand: product.brand,
        quantity: 1
      }
      currentItems.push(newItem)
      debugLog('Added new item to cart:', newItem)
    }

    // Replace the entire array with a plain copy to guarantee reactivity
    try {
      items.value = JSON.parse(JSON.stringify(currentItems))
    } catch (e) {
      items.value = currentItems.slice()
    }
    changeTick.value++
    debugLog('Cart items after operation:', items.value)
    debugLog('Total items count:', totalItems.value)

    // Force immediate save as backup
    setTimeout(() => saveCartToStorage(), 100)
    // If user is logged in and not suppressed, attempt background sync to server
    if (authStore.isLoggedIn && !options.suppressBackgroundSync) {
      // fire-and-forget, refetch on failure
      customerApi.addToCart(product.id, product.quantity || 1).catch((err) => {
        console.error('Background addToCart failed, refetching remote cart', err)
        fetchRemoteCart()
      })
    }

    // Return the updated items for debugging
    return items.value
  }

  const removeFromCart = (productId) => {
    debugLog('Removing product from cart:', productId)
    const currentItems = [...items.value]
    const index = currentItems.findIndex(item => item.id === productId)
    if (index !== -1) {
      currentItems.splice(index, 1)
      try {
        items.value = JSON.parse(JSON.stringify(currentItems))
      } catch (e) {
        items.value = currentItems.slice()
      }
      changeTick.value++
      debugLog('Product removed from cart')
      // Force immediate save as backup
      setTimeout(() => saveCartToStorage(), 100)
    } else {
      debugLog('Product not found in cart for removal')
    }
  }

  const updateQuantity = (productId, quantity) => {
    debugLog(`Updating quantity for product ${productId} to ${quantity}`)
    const currentItems = [...items.value]
    const itemIndex = currentItems.findIndex(item => item.id === productId)

    if (itemIndex !== -1) {
      if (quantity <= 0) {
        removeFromCart(productId)
      } else {
        // Update the item with new quantity - create new object for reactivity
        currentItems[itemIndex] = {
          ...currentItems[itemIndex],
          quantity: quantity
        }
        try {
          items.value = JSON.parse(JSON.stringify(currentItems))
        } catch (e) {
          items.value = currentItems.slice()
        }
        changeTick.value++
        debugLog('Quantity updated successfully')
        // Force immediate save as backup
        setTimeout(() => saveCartToStorage(), 100)
      }
    } else {
      debugLog('Product not found for quantity update')
    }
  }

  // Server sync helpers - only used when user is authenticated
  const fetchRemoteCart = async () => {
    if (!authStore.isLoggedIn) return null
    try {
      const res = await customerApi.getCart()
      if (res && res.success) {
        // map server shape to local items
        const mapped = (res.data || []).map((p) => {
          // support multiple shapes: { product_id, name, price, quantity }
          // or { id, product: { id, name, price, images } }
          const productObj = p.product || {}
          const id = p.product_id ?? p.id ?? productObj.id ?? null
          const title = p.name ?? p.title ?? productObj.name ?? productObj.title ?? ''
          // coerce to number safely
          const priceRaw = p.price ?? productObj.price ?? p.unit_price ?? 0
          const price = Number(priceRaw) || 0
          const qtyRaw = p.quantity ?? p.qty ?? p.quantity ?? p.qty ?? p.quantity
          const quantity = Number(qtyRaw) || 1
          const image = p.image ?? productObj.image ?? productObj.images?.[0]?.url ?? ''
          const brand = p.brand ?? p.category ?? productObj.brand ?? ''
          return { id, title, price, image, brand, quantity }
        })
        // Enrich items by fetching product details for missing fields
        const axiosInstance = await import('@/api/axios').then(m => m.default)
        const enriched = await Promise.all(mapped.map(async (it) => {
          try {
            if ((!it.title || !it.image || !it.price) && it.id) {
              const p = await axiosInstance.get(`/products/${it.id}`)
              const pd = p?.data?.data ?? p?.data ?? null
              if (pd) {
                it.title = it.title || pd.name || pd.title || pd.product_name || ''
                it.price = Number(it.price) || Number(pd.price) || Number(pd.unit_price) || it.price
                it.image = it.image || pd.image || pd.image_url || pd.images?.[0]?.url || ''
              }
            }
          } catch (e) {
            // ignore enrichment errors
          }
          return it
        }))

        // Merge server items with local items: preserve local-only entries (optimistic adds)
        try {
          const localMap = new Map(items.value.map(i => [Number(i.id), i]))
          const merged = [...enriched]
          for (const localItem of items.value) {
            const lid = Number(localItem.id)
            if (!merged.some(mi => Number(mi.id) === lid)) {
              // keep local-only item
              merged.push(localItem)
            }
          }
          items.value = merged
          debugLog('Fetched remote cart and merged with local cart', items.value)
          saveCartToStorage()
        } catch (e) {
          // fallback to server items if merge fails
          items.value = enriched
          debugLog('Fetched remote cart (merge failed), replaced local cart', items.value)
          saveCartToStorage()
        }
        return res
      }
      return res
    } catch (error) {
      console.error('fetchRemoteCart error', error)
      return null
    }
  }

  const syncAdd = async (product) => {
    if (!product || !product.id) return
    const pid = product.id
    // prevent duplicate in-flight adds for same product
    if (pendingAdds.has(pid)) {
      debugLog('syncAdd skipped because add already pending for', pid)
      return
    }
    pendingAdds.add(pid)

    // optimistic add locally (suppress background sync inside addToCart)
    addToCart(product, { suppressBackgroundSync: true })
    if (!authStore.isLoggedIn) {
      pendingAdds.delete(pid)
      return
    }
    try {
      const res = await customerApi.addToCart(product.id, product.quantity || 1)
      // on success, refresh from server to get canonical data
      if (res && res.success) {
        await fetchRemoteCart()
      }
      return res
    } catch (error) {
      console.error('syncAdd failed, refetching remote cart', error)
      await fetchRemoteCart()
      throw error
    } finally {
      pendingAdds.delete(pid)
    }
  }

  const syncUpdate = async (productId, quantity) => {
    updateQuantity(productId, quantity)
    if (!authStore.isLoggedIn) return
    try {
      const res = await customerApi.updateCartItem(productId, quantity)
      if (res && res.success) await fetchRemoteCart()
      return res
    } catch (error) {
      console.error('syncUpdate failed, refetching remote cart', error)
      await fetchRemoteCart()
      throw error
    }
  }

  const syncRemove = async (productId) => {
    if (!productId) return
    // prevent duplicate remove requests
    if (pendingRemoves.has(productId)) {
      debugLog('syncRemove skipped because remove already pending for', productId)
      return
    }
    pendingRemoves.add(productId)

    // Optimistically remove locally
    removeFromCart(productId)
    if (!authStore.isLoggedIn) {
      // no server to sync to for guest users
      pendingRemoves.delete(productId)
      return
    }
    try {
      const res = await customerApi.removeFromCart(productId)
      if (res && res.success) {
        await fetchRemoteCart()
      }
      return res
    } catch (error) {
      console.error('syncRemove failed, refetching remote cart', error)
      await fetchRemoteCart()
      throw error
    } finally {
      pendingRemoves.delete(productId)
    }
  }

  const clearCart = () => {
    debugLog('Clearing entire cart')
    items.value = []
    // Force immediate save as backup
    setTimeout(() => saveCartToStorage(), 100)
  }

  const getItemQuantity = (productId) => {
    const item = items.value.find(item => item.id === productId)
    const quantity = item ? item.quantity : 0
    debugLog(`Getting quantity for product ${productId}:`, quantity)
    return quantity
  }

  return {
    // State
    items,
    isInitialized,

    // Getters
    cartItems,
    totalItems,
    totalPrice,
    itemCount,
    isInCart,

    // Actions
    addToCart,
    fetchRemoteCart,
    syncAdd,
    syncUpdate,
    syncRemove,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemQuantity,
    manualSave
  }
})
