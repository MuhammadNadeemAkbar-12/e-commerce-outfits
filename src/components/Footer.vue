<template>
  <footer class="site-footer">
    <div class="footer-wrap">
      <div class="footer-brand">
        <router-link to="/" class="brand-link">StyleHub</router-link>
        <p>Browse the current product collection and manage your purchases in one place.</p>
      </div>
      <div class="footer-columns">
        <nav class="footer-links" aria-label="Shop navigation">
          <span>Explore</span>
          <router-link to="/">Home</router-link>
          <a href="#products" @click.prevent="goToProducts">Products</a>
          <router-link to="/contact">Contact</router-link>
        </nav>
        <nav class="footer-links" aria-label="Account navigation">
          <span>Account</span>
          <router-link to="/loginuser">Login</router-link>
          <router-link to="/registeruser">Register</router-link>
          <router-link to="/customer/orders">Orders</router-link>
        </nav>
      </div>
    </div>
    <div class="footer-bottom">© {{ year }} StyleHub</div>
  </footer>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const year = new Date().getFullYear()

async function goToProducts() {
  if (router.currentRoute.value.path !== '/') await router.push('/')
  requestAnimationFrame(() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }))
}
</script>

<style scoped>
.site-footer { background: #18231f; color: #d9e0dc; }.footer-wrap { display: flex; width: min(100% - 2rem, 1180px); align-items: flex-start; justify-content: space-between; gap: 4rem; margin: 0 auto; padding: 3.5rem 0 3rem; }.footer-brand { max-width: 29rem; }.brand-link { color: #fffaf2; font-family: Georgia, serif; font-size: 1.55rem; font-weight: 700; letter-spacing: -.02em; text-decoration: none; }.footer-brand p { margin: .65rem 0 0; color: #9eaaa3; font-size: .9rem; line-height: 1.65; }.footer-columns { display: flex; gap: clamp(2.5rem, 7vw, 5rem); }.footer-links { display: flex; min-width: 6rem; align-items: flex-start; flex-direction: column; gap: .65rem; }.footer-links span { margin-bottom: .25rem; color: #bda991; font-size: .67rem; font-weight: 800; letter-spacing: .13em; text-transform: uppercase; }.footer-links a { color: #d9e0dc; font-size: .86rem; font-weight: 600; text-decoration: none; }.footer-links a:hover, .footer-links a:focus-visible { color: #f0cfaa; }.footer-bottom { width: min(100% - 2rem, 1180px); margin: 0 auto; border-top: 1px solid #334039; padding: 1.05rem 0; color: #849088; font-size: .75rem; }
@media (max-width: 640px) { .footer-wrap { width: min(100% - 1.25rem, 1180px); align-items: flex-start; flex-direction: column; gap: 2.2rem; padding: 2.6rem 0; }.footer-columns { width: 100%; gap: 2rem; }.footer-links { flex: 1; }.footer-bottom { width: min(100% - 1.25rem, 1180px); } }
</style>
