<template>
  <main class="home-page">
    <section class="hero" aria-labelledby="hero-title">
      <div class="page-width hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">StyleHub collection</p>
          <h1 id="hero-title">Thoughtful products for the spaces you use every day.</h1>
          <p class="hero-description">
            Browse the current collection, compare what is available, and add the pieces that suit your needs.
          </p>
          <div class="hero-actions">
            <button class="button button--primary" type="button" @click="scrollTo('products')">Explore products</button>
            <button class="button button--secondary" type="button" @click="scrollTo('categories')">Browse categories</button>
          </div>
        </div>

        <div class="hero-showcase" aria-label="Featured product preview">
          <img v-if="heroProduct?.image" :src="heroProduct.image" :alt="heroProduct.name" class="hero-image" />
          <div v-else class="hero-art" aria-hidden="true">
            <span class="hero-art__sun"></span>
            <span class="hero-art__arch"></span>
            <span class="hero-art__base"></span>
          </div>
          <div v-if="heroProduct" class="hero-product">
            <span class="hero-product__label">Available now</span>
            <strong>{{ heroProduct.name }}</strong>
            <span>{{ formatPrice(heroProduct.displayPrice) }}</span>
          </div>
          <div v-else-if="loadingProducts" class="hero-product hero-product--loading">Loading collection…</div>
        </div>
      </div>
    </section>

    <section id="categories" class="section page-width" aria-labelledby="categories-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Browse your way</p>
          <h2 id="categories-title">Shop by category</h2>
        </div>
        <button v-if="selectedCategory" class="text-button" type="button" @click="selectCategory(null)">View all products</button>
      </div>

      <div v-if="loadingCategories" class="category-grid" aria-label="Loading categories">
        <div v-for="item in 4" :key="item" class="category-card category-card--skeleton"></div>
      </div>
      <div v-else-if="categoriesError" class="state-card state-card--error">
        <p>{{ categoriesError }}</p>
        <button class="text-button" type="button" @click="loadCategories">Try again</button>
      </div>
      <div v-else-if="categories.length" class="category-grid">
        <button
          v-for="category in categories"
          :key="category.id"
          class="category-card"
          :class="{ 'category-card--active': selectedCategory?.id === category.id }"
          type="button"
          @click="selectCategory(category)">
          <span class="category-card__index">{{ String(category.id).padStart(2, '0') }}</span>
          <span class="category-card__name">{{ category.name }}</span>
          <span v-if="typeof category.products_count === 'number'" class="category-card__count">
            {{ category.products_count }} {{ category.products_count === 1 ? 'product' : 'products' }}
          </span>
          <span class="category-card__arrow" aria-hidden="true">↗</span>
        </button>
      </div>
      <div v-else class="state-card">No categories are available yet.</div>
    </section>

    <section id="products" class="section section--products" aria-labelledby="products-title">
      <div class="page-width">
        <div class="section-heading section-heading--products">
          <div>
            <p class="eyebrow">Current collection</p>
            <h2 id="products-title">
              {{ searchTerm ? `Search results for “${searchTerm}”` : selectedCategory ? selectedCategory.name : 'Featured products' }}
            </h2>
          </div>
          <p v-if="!loadingProducts && products.length" class="result-count">{{ products.length }} {{ products.length === 1 ? 'product' : 'products' }} shown</p>
        </div>

        <div v-if="loadingProducts" class="product-grid" aria-label="Loading products">
          <article v-for="item in 4" :key="item" class="product-card product-card--skeleton">
            <div class="product-card__media"></div><div class="product-card__body"></div>
          </article>
        </div>
        <div v-else-if="productsError" class="state-card state-card--error">
          <p>{{ productsError }}</p>
          <button class="text-button" type="button" @click="loadProducts">Try again</button>
        </div>
        <div v-else-if="products.length" class="product-grid">
          <article v-for="product in products" :key="product.id" class="product-card">
            <div class="product-card__media">
              <img v-if="product.image" :src="product.image" :alt="product.name" loading="lazy" />
              <div v-else class="product-card__fallback" aria-hidden="true">{{ product.name.charAt(0) }}</div>
              <span class="stock-pill" :class="product.stock > 0 ? 'stock-pill--in' : 'stock-pill--out'">
                {{ product.stock > 0 ? 'In stock' : 'Out of stock' }}
              </span>
            </div>
            <div class="product-card__body">
              <p class="product-card__category">{{ product.categoryName }}</p>
              <h3>{{ product.name }}</h3>
              <p v-if="product.description" class="product-card__description">{{ product.description }}</p>
              <div class="product-card__footer">
                <div>
                  <span v-if="product.salePrice && product.salePrice !== product.price" class="product-card__was">{{ formatPrice(product.price) }}</span>
                  <strong>{{ formatPrice(product.displayPrice) }}</strong>
                </div>
                <div class="product-card__actions">
                  <button class="text-button product-view" type="button" @click="openProduct(product)">View</button>
                  <button
                    v-if="canUseWishlist"
                    class="icon-button"
                    type="button"
                    :aria-label="wishlistStore.isInWishlist(product.id) ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`"
                    :aria-pressed="wishlistStore.isInWishlist(product.id)"
                    @click="toggleWishlist(product)">
                    {{ wishlistStore.isInWishlist(product.id) ? '♥' : '♡' }}
                  </button>
                  <button class="button button--compact" type="button" :disabled="product.stock <= 0" @click="addToCart(product)">Add to cart</button>
                </div>
              </div>
            </div>
          </article>
        </div>
        <div v-else class="state-card">
          No products are available{{ searchTerm ? ` for “${searchTerm}”` : selectedCategory ? ' in this category' : '' }}.
          <button v-if="selectedCategory" class="text-button" type="button" @click="selectCategory(null)">View all products</button>
        </div>
      </div>
    </section>

    <section class="value-section">
      <div class="page-width value-grid">
        <div>
          <p class="eyebrow">Simple product discovery</p>
          <h2>Find the right product for your space.</h2>
          <p>Use the live category list to narrow the collection, then add available products directly to your cart.</p>
        </div>
        <button class="button button--light" type="button" @click="scrollTo('products')">View all products</button>
      </div>
    </section>

    <q-dialog v-model="detailOpen">
      <article v-if="detailProduct" class="product-dialog" aria-labelledby="product-dialog-title">
        <button class="product-dialog__close" type="button" aria-label="Close product details" @click="detailOpen = false">×</button>
        <div class="product-dialog__media">
          <img v-if="detailProduct.image" :src="detailProduct.image" :alt="detailProduct.name" />
          <div v-else class="product-card__fallback" aria-hidden="true">{{ detailProduct.name.charAt(0) }}</div>
        </div>
        <div class="product-dialog__content">
          <p class="eyebrow">{{ detailProduct.categoryName }}</p>
          <h2 id="product-dialog-title">{{ detailProduct.name }}</h2>
          <p v-if="detailProduct.description">{{ detailProduct.description }}</p>
          <strong class="product-dialog__price">{{ formatPrice(detailProduct.displayPrice) }}</strong>
          <p class="product-dialog__stock">{{ detailProduct.stock > 0 ? `${detailProduct.stock} in stock` : 'Currently out of stock' }}</p>
          <div v-if="detailProduct.stock > 0" class="product-dialog__buy">
            <div class="quantity-control" aria-label="Product quantity">
              <button type="button" aria-label="Decrease quantity" :disabled="detailQuantity <= 1" @click="changeDetailQuantity(-1)">−</button>
              <output aria-live="polite">{{ detailQuantity }}</output>
              <button type="button" aria-label="Increase quantity" :disabled="detailQuantity >= detailProduct.stock" @click="changeDetailQuantity(1)">+</button>
            </div>
            <button class="button button--primary" type="button" @click="addToCart(detailProduct, detailQuantity)">Add to cart</button>
          </div>
          <button v-else class="button button--primary" type="button" disabled>Unavailable</button>
        </div>
      </article>
    </q-dialog>
  </main>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import { resolveUrl } from '@/utils/imageUrl'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()

const categories = ref([])
const products = ref([])
const selectedCategory = ref(null)
const loadingCategories = ref(true)
const loadingProducts = ref(true)
const categoriesError = ref('')
const productsError = ref('')
const detailOpen = ref(false)
const detailProduct = ref(null)
const detailQuantity = ref(1)
const searchTerm = ref('')
const routeFiltersReady = ref(false)

const heroProduct = computed(() => products.value.find((product) => product.stock > 0) || products.value[0] || null)
const canUseWishlist = computed(() => authStore.isLoggedIn && ['customer', 'buyer'].includes(authStore.role))

function apiArray(response) {
  return Array.isArray(response?.data?.data) ? response.data.data : []
}

function paginatedArray(response) {
  return Array.isArray(response?.data?.data?.data) ? response.data.data.data : []
}

function productImage(product) {
  const image = Array.isArray(product.images) ? product.images[0] : product.image
  const path = typeof image === 'string' ? image : image?.url || image?.image_path
  return resolveUrl(path)
}

function normaliseProduct(product) {
  const price = Number(product.price || 0)
  const salePrice = product.sale_price == null ? null : Number(product.sale_price)
  const category = categories.value.find((item) => Number(item.id) === Number(product.category_id))
  return {
    id: product.id,
    name: product.name || 'Product',
    description: product.description || '',
    price,
    salePrice,
    displayPrice: salePrice && salePrice < price ? salePrice : price,
    stock: Number(product.stock || 0),
    categoryName: category?.name || 'Uncategorised',
    image: productImage(product),
  }
}

function formatPrice(value) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(value || 0)
}

async function loadCategories() {
  loadingCategories.value = true
  categoriesError.value = ''
  try {
    const response = await axios.get('/categories-products', { skipAuthRedirect: true })
    categories.value = apiArray(response).map((category) => ({
      id: category.id,
      name: category.name,
      products_count: category.products_count,
    }))
  } catch {
    categoriesError.value = 'Categories could not be loaded.'
  } finally {
    loadingCategories.value = false
  }
}

async function loadProducts() {
  loadingProducts.value = true
  productsError.value = ''
  try {
    const response = await axios.get('/products', {
      params: {
        page: 1,
        search: searchTerm.value || undefined,
        category_id: selectedCategory.value?.id || undefined,
      },
      skipAuthRedirect: true,
    })
    products.value = paginatedArray(response).map(normaliseProduct)
  } catch {
    productsError.value = selectedCategory.value ? 'Products in this category could not be loaded.' : 'Products could not be loaded.'
  } finally {
    loadingProducts.value = false
  }
}

async function selectCategory(category) {
  await router.push({ path: '/', query: category ? { category: category.id } : {} })
}

async function applyRouteFilters() {
  const categoryId = Number(route.query.category || 0)
  searchTerm.value = typeof route.query.search === 'string' ? route.query.search.trim() : ''
  selectedCategory.value = categoryId
    ? categories.value.find((category) => Number(category.id) === categoryId) || null
    : null
  await loadProducts()
  scrollTo('products')
}

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function cartPayload(product, quantity = 1) {
  return { id: product.id, title: product.name, price: product.displayPrice, image: product.image, brand: product.categoryName, quantity }
}

function openProduct(product) {
  detailProduct.value = product
  detailQuantity.value = 1
  detailOpen.value = true
}

function changeDetailQuantity(delta) {
  detailQuantity.value = Math.min(Math.max(detailQuantity.value + delta, 1), detailProduct.value?.stock || 1)
}

async function addToCart(product, quantity = 1) {
  try {
    const safeQuantity = Math.min(Math.max(Number(quantity) || 1, 1), product.stock || 1)
    if (authStore.checkAuth()) await cartStore.syncAdd(cartPayload(product, safeQuantity))
    else cartStore.addToCart(cartPayload(product, safeQuantity))
    $q.notify({ type: 'positive', message: 'Product added to cart' })
  } catch {
    $q.notify({ type: 'negative', message: 'Could not add this product to the cart' })
  }
}

async function toggleWishlist(product) {
  try {
    if (wishlistStore.isInWishlist(product.id)) await wishlistStore.remove(product.id)
    else await wishlistStore.add(product.id)
  } catch {
    $q.notify({ type: 'negative', message: 'Could not update the wishlist' })
  }
}

onMounted(async () => {
  await loadCategories()
  await applyRouteFilters()
  routeFiltersReady.value = true
})

watch(
  () => route.fullPath,
  async () => {
    if (routeFiltersReady.value) await applyRouteFilters()
  },
)
</script>

<style scoped>
.home-page { overflow: hidden; background: #fcfaf7; color: #27231f; }
.page-width { width: min(100% - 2rem, 1180px); margin-inline: auto; }
.hero { padding: clamp(3.5rem, 8vw, 7rem) 0 4.5rem; background: linear-gradient(120deg, #e9dfd0, #f8f5ef 53%, #ded1c0); }
.hero-grid { display: grid; grid-template-columns: 1.05fr .95fr; align-items: center; gap: clamp(2rem, 6vw, 5.5rem); }.hero-copy { min-width: 0; }
.eyebrow { margin: 0 0 .65rem; color: #84664b; font-size: .73rem; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
h1, h2, h3, p { margin-top: 0; }
h1 { max-width: 11ch; margin-bottom: 1.25rem; font-family: Georgia, 'Times New Roman', serif; font-size: clamp(2.6rem, 5.6vw, 5rem); font-weight: 600; letter-spacing: -.055em; line-height: .98; }
h2 { margin-bottom: .25rem; font-family: Georgia, 'Times New Roman', serif; font-size: clamp(2rem, 3.8vw, 3rem); font-weight: 600; letter-spacing: -.045em; line-height: 1.05; }
.hero-description { max-width: 34rem; overflow-wrap: anywhere; color: #5f574e; font-size: 1.05rem; line-height: 1.65; }
.hero-actions { display: flex; flex-wrap: wrap; gap: .8rem; margin-top: 1.8rem; }
.button { display: inline-flex; min-height: 2.9rem; align-items: center; justify-content: center; border: 1px solid transparent; border-radius: 999px; padding: .7rem 1.2rem; font: inherit; font-size: .9rem; font-weight: 700; cursor: pointer; transition: transform .2s ease, background-color .2s ease, border-color .2s ease; }
.button:hover { transform: translateY(-2px); }.button:focus-visible, .text-button:focus-visible, .category-card:focus-visible, .icon-button:focus-visible { outline: 3px solid #b8885b; outline-offset: 3px; }
.button--primary { background: #2c4b44; color: #fff; }.button--primary:hover { background: #223c36; }.button--secondary { border-color: #8b7968; background: rgba(255,255,255,.35); color: #302a24; }.button--secondary:hover { background: #fff; }.button--compact { min-height: 2.4rem; padding: .5rem .85rem; background: #2c4b44; color: #fff; }.button--compact:disabled { cursor: not-allowed; opacity: .45; transform: none; }.button--light { background: #f7f1e8; color: #2c4b44; }
.hero-showcase { position: relative; min-height: 385px; overflow: hidden; border: 1px solid rgba(83,66,47,.13); border-radius: 2rem; background: #cbbba6; box-shadow: 0 24px 50px rgba(63,48,33,.18); }.hero-image { width: 100%; height: 100%; min-height: 385px; object-fit: cover; }.hero-art { position: absolute; inset: 0; overflow: hidden; background: linear-gradient(145deg, #b6a287, #d9cbb9); }.hero-art__sun { position: absolute; top: 12%; right: 15%; width: 8rem; aspect-ratio: 1; border-radius: 50%; background: #e7d9bd; }.hero-art__arch { position: absolute; right: 18%; bottom: 16%; width: 42%; height: 55%; border-radius: 999px 999px 0 0; background: #725e4b; }.hero-art__base { position: absolute; right: 8%; bottom: 0; width: 69%; height: 25%; border-radius: 5rem 0 0; background: #3e514b; }.hero-product { position: absolute; right: 1.1rem; bottom: 1.1rem; left: 1.1rem; display: grid; gap: .15rem; border: 1px solid rgba(255,255,255,.4); border-radius: 1rem; padding: .9rem 1rem; background: rgba(34,31,27,.77); color: #fff; backdrop-filter: blur(8px); }.hero-product__label { color: #e4ceb2; font-size: .7rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }.hero-product--loading { display: block; }
.section { padding-top: clamp(3.8rem, 7vw, 6rem); padding-bottom: 1rem; }.section--products { padding-bottom: clamp(4.5rem, 8vw, 7rem); }.section-heading { display: flex; align-items: end; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem; }.section-heading--products { align-items: center; }.text-button { border: 0; padding: .35rem 0; background: transparent; color: #345a50; font: inherit; font-size: .9rem; font-weight: 800; cursor: pointer; text-decoration: underline; text-underline-offset: .25rem; }.result-count { margin: 0; color: #776c61; font-size: .9rem; }
.category-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }.category-card { position: relative; min-height: 162px; border: 1px solid #ded6cc; border-radius: 1rem; padding: 1.2rem; overflow: hidden; background: #fffdf9; color: #2d2925; text-align: left; cursor: pointer; transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease; }.category-card:hover, .category-card--active { border-color: #9a7c5d; box-shadow: 0 12px 22px rgba(67,49,31,.1); transform: translateY(-3px); }.category-card::after { position: absolute; right: -1rem; bottom: -2.8rem; width: 7rem; height: 7rem; border-radius: 50%; background: #e9dfd1; content: ''; }.category-card__index, .category-card__count { display: block; position: relative; z-index: 1; }.category-card__index { color: #947457; font-size: .72rem; font-weight: 800; letter-spacing: .1em; }.category-card__name { position: relative; z-index: 1; display: block; max-width: 11ch; margin-top: 2.25rem; font-family: Georgia, 'Times New Roman', serif; font-size: 1.35rem; font-weight: 600; line-height: 1.08; }.category-card__count { margin-top: .35rem; color: #746b62; font-size: .8rem; }.category-card__arrow { position: absolute; right: 1rem; bottom: .85rem; z-index: 1; color: #2c4b44; font-size: 1.3rem; }.category-card--skeleton, .product-card--skeleton { min-height: 160px; border: 0; background: linear-gradient(110deg, #eee8df 8%, #f8f5ef 18%, #eee8df 33%); background-size: 200% 100%; animation: shimmer 1.35s linear infinite; }.state-card { border: 1px dashed #cbbdaa; border-radius: 1rem; padding: 1.25rem; background: #fffdf9; color: #62584e; }.state-card--error { border-color: #dbb7ac; color: #963f30; }
.section--products { background: #f4f0e9; }.product-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.2rem; }.product-card { display: flex; min-width: 0; flex-direction: column; overflow: hidden; border: 1px solid #dfd8cf; border-radius: 1.1rem; background: #fffdfb; transition: transform .2s ease, box-shadow .2s ease; }.product-card:hover { box-shadow: 0 15px 30px rgba(55,43,30,.12); transform: translateY(-4px); }.product-card__media { position: relative; height: 205px; overflow: hidden; background: #e2d6c8; }.product-card__media img { width: 100%; height: 100%; object-fit: cover; }.product-card__fallback { display: grid; width: 100%; height: 100%; place-items: center; background: linear-gradient(145deg, #d5c2ac, #a18c76); color: #fff8ed; font-family: Georgia, serif; font-size: 4rem; }.stock-pill { position: absolute; top: .75rem; left: .75rem; border-radius: 999px; padding: .35rem .6rem; font-size: .69rem; font-weight: 800; }.stock-pill--in { background: #e2efe9; color: #285a47; }.stock-pill--out { background: #f5e3df; color: #9b4035; }.product-card__body { display: flex; flex: 1; min-width: 0; flex-direction: column; padding: 1rem; }.product-card__category { margin-bottom: .35rem; color: #876a50; font-size: .72rem; font-weight: 800; letter-spacing: .09em; text-transform: uppercase; }.product-card h3 { margin-bottom: .45rem; font-family: Georgia, serif; font-size: 1.25rem; font-weight: 600; line-height: 1.15; }.product-card__description { display: -webkit-box; overflow: hidden; margin-bottom: 1rem; color: #6a625a; font-size: .86rem; line-height: 1.45; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }.product-card__footer { display: flex; align-items: end; justify-content: space-between; gap: .6rem; margin-top: auto; }.product-card__footer strong { display: block; color: #2c4b44; font-size: 1rem; }.product-card__was { display: block; color: #8d8379; font-size: .76rem; text-decoration: line-through; }.product-card__actions { display: flex; align-items: center; gap: .4rem; }.icon-button { width: 2.4rem; height: 2.4rem; border: 1px solid #d8cfc4; border-radius: 50%; background: #fff; color: #6c5140; font-size: 1.25rem; cursor: pointer; }
.value-section { padding: clamp(3rem, 7vw, 5.5rem) 0; background: #2c4b44; color: #fbf7f0; }.value-grid { display: flex; align-items: center; justify-content: space-between; gap: 2rem; }.value-grid h2 { max-width: 15ch; }.value-grid p:not(.eyebrow) { max-width: 37rem; margin-bottom: 0; color: #d7e1d9; line-height: 1.6; }.value-section .eyebrow { color: #e4c4a4; }
.product-view { padding-inline: .25rem; text-decoration: none; }.product-dialog { position: relative; display: grid; width: min(92vw, 760px); max-height: 88vh; grid-template-columns: .9fr 1.1fr; overflow: auto; border-radius: 1.25rem; background: #fffdf9; color: #27231f; }.product-dialog__media { min-height: 360px; background: #d5c2ac; }.product-dialog__media img { width: 100%; height: 100%; object-fit: cover; }.product-dialog__content { display: flex; min-width: 0; flex-direction: column; align-items: flex-start; justify-content: center; padding: 2rem; }.product-dialog__content h2 { overflow-wrap: anywhere; }.product-dialog__content > p:not(.eyebrow) { color: #6a625a; line-height: 1.6; }.product-dialog__price { margin-top: .5rem; color: #2c4b44; font-size: 1.35rem; }.product-dialog__stock { margin: .25rem 0 1.25rem; font-size: .85rem; }.product-dialog__close { position: absolute; top: .75rem; right: .75rem; z-index: 2; display: grid; width: 2.5rem; height: 2.5rem; place-items: center; border: 1px solid #d8cfc4; border-radius: 50%; background: rgba(255,253,249,.92); color: #2d2925; font-size: 1.4rem; cursor: pointer; }.product-dialog__buy { display: flex; width: 100%; align-items: center; gap: .75rem; }.quantity-control { display: grid; grid-template-columns: 2.45rem 2.25rem 2.45rem; overflow: hidden; border: 1px solid #d8cfc4; border-radius: .7rem; background: #fff; }.quantity-control button { display: grid; min-height: 2.75rem; place-items: center; border: 0; background: transparent; color: #315f55; font-size: 1.15rem; cursor: pointer; }.quantity-control button:hover:not(:disabled) { background: #edf2ef; }.quantity-control button:disabled { cursor: not-allowed; opacity: .35; }.quantity-control output { display: grid; place-items: center; border-right: 1px solid #e5dfd6; border-left: 1px solid #e5dfd6; font-size: .9rem; font-weight: 750; }
@keyframes shimmer { to { background-position-x: -200%; } }
@media (max-width: 900px) { .hero-grid { grid-template-columns: 1fr; }.hero-showcase { min-height: 300px; }.hero-image { min-height: 300px; }.category-grid, .product-grid { grid-template-columns: repeat(2, 1fr); }.product-card__media { height: 230px; } }
@media (max-width: 560px) { .page-width { width: min(100% - 1.25rem, 1180px); }.hero { padding-top: 3.25rem; }.hero-showcase { min-height: 255px; border-radius: 1.25rem; }.hero-image { min-height: 255px; }.section-heading, .value-grid { align-items: flex-start; flex-direction: column; }.category-grid, .product-grid { grid-template-columns: 1fr; }.category-card { min-height: 138px; }.category-card__name { margin-top: 1.5rem; }.product-card__media { height: 245px; }.value-grid { gap: 1.25rem; }.product-dialog { grid-template-columns: 1fr; }.product-dialog__media { min-height: 190px; max-height: 220px; }.product-dialog__content { padding: 1.25rem; }.product-dialog__buy { align-items: stretch; flex-direction: column; }.product-dialog__buy .button { width: 100%; }.quantity-control { width: 100%; grid-template-columns: 1fr 1fr 1fr; } }
</style>
