<template>
  <footer class="site-footer">
    <div class="footer-wrap">
      <div class="footer-brand">
        <router-link to="/loginuser" class="brand-link">Stock &amp; Sales BMS</router-link>
        <p>Web-based Stock, Inventory and Sales Management System for Admin, Manager and Salesman staff.</p>
      </div>
      <div class="footer-columns">
        <nav class="footer-links" aria-label="System navigation">
          <span>System</span>
          <router-link to="/loginuser">Staff login</router-link>
          <router-link to="/catalogue">Catalogue (legacy)</router-link>
          <router-link to="/contact">Contact</router-link>
        </nav>
        <nav class="footer-links" aria-label="Account navigation">
          <span>Access</span>
          <router-link to="/loginuser">Login</router-link>
          <router-link to="/admin/login">Admin login</router-link>
        </nav>
      </div>
    </div>
    <div class="footer-bottom">© {{ year }} Stock, Inventory &amp; Sales Management System · Amounts in PKR</div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
</script>

<style scoped>
.site-footer { background: #18231f; color: #d9e0dc; }
.footer-wrap { display: flex; width: min(100% - 2rem, 1180px); align-items: flex-start; justify-content: space-between; gap: 4rem; margin: 0 auto; padding: 3.5rem 0 3rem; }
.footer-brand { max-width: 29rem; }
.brand-link { color: #fffaf2; font-family: Georgia, serif; font-size: 1.55rem; font-weight: 700; letter-spacing: -.02em; text-decoration: none; }
.footer-brand p { margin: .65rem 0 0; color: #9eaaa3; font-size: .9rem; line-height: 1.65; }
.footer-columns { display: flex; gap: clamp(2.5rem, 7vw, 5rem); }
.footer-links { display: flex; min-width: 6rem; align-items: flex-start; flex-direction: column; gap: .65rem; }
.footer-links span { margin-bottom: .25rem; color: #bda991; font-size: .67rem; font-weight: 800; letter-spacing: .13em; text-transform: uppercase; }
.footer-links a { color: #d9e0dc; font-size: .86rem; font-weight: 600; text-decoration: none; }
.footer-links a:hover, .footer-links a:focus-visible { color: #f0cfaa; }
.footer-bottom { width: min(100% - 2rem, 1180px); margin: 0 auto; border-top: 1px solid #334039; padding: 1.05rem 0; color: #849088; font-size: .75rem; }
@media (max-width: 800px) { .footer-wrap { flex-direction: column; gap: 2rem; padding: 2.5rem 0 2rem; } }
</style>
