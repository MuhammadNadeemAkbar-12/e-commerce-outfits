<template>
  <main class="landing">
    <section class="hero">
      <div class="shell hero-grid">
        <div class="copy">
          <p class="eyebrow">CS619 · Business Management System</p>
          <h1>Web-based Stock, Inventory and Sales Management System</h1>
          <p class="lede">
            Internal operations for Admin, Manager and Salesman staff — inventory control, supplier purchases,
            sales invoices, returns, reports and backups. Amounts are shown in Pakistani Rupees (PKR).
          </p>
          <div class="actions">
            <router-link class="btn btn-primary" to="/loginuser">Staff login</router-link>
            <router-link class="btn btn-ghost" to="/admin/login">Admin login</router-link>
          </div>
          <p class="hint">Authorized employees only. Public shopping is not part of the BMS workflow.</p>
        </div>
        <aside class="panel" aria-label="Role overview">
          <h2>Staff roles</h2>
          <ul>
            <li><strong>Admin</strong> — users, inventory, purchases, sales, reports, backups, activity logs</li>
            <li><strong>Manager</strong> — inventory, purchases, invoices, customers, suppliers, returns, reports</li>
            <li><strong>Salesman</strong> — customers, sales invoices, returns and sales history</li>
          </ul>
        </aside>
      </div>
    </section>

    <section class="modules shell">
      <h2>Core modules</h2>
      <div class="module-grid">
        <article v-for="m in modules" :key="m.title">
          <h3>{{ m.title }}</h3>
          <p>{{ m.text }}</p>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup>
const modules = [
  { title: 'Inventory & Stock', text: 'Maintain products, quantities, low-stock alerts and stock movement history.' },
  { title: 'Purchases', text: 'Receive supplier purchases and increase stock only when receiving is confirmed.' },
  { title: 'Sales Invoices', text: 'Create multi-item invoices, finalize sales, deduct stock and print PKR invoices.' },
  { title: 'Returns & Reports', text: 'Approve customer returns, restore stock, and generate daily/monthly/yearly reports.' },
]
</script>

<style scoped>
.landing {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.18), transparent 40%),
    linear-gradient(160deg, #0f172a 0%, #1e293b 45%, #0f766e 100%);
  color: #e2e8f0;
}
.shell {
  width: min(1120px, calc(100% - 2rem));
  margin: 0 auto;
}
.hero {
  padding: clamp(3rem, 8vw, 5.5rem) 0 3rem;
}
.hero-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: 1.4fr 1fr;
  align-items: stretch;
}
.eyebrow {
  margin: 0 0 0.75rem;
  color: #99f6e4;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
h1 {
  margin: 0;
  font-size: clamp(1.8rem, 4vw, 2.85rem);
  line-height: 1.15;
  color: #f8fafc;
}
.lede {
  margin: 1rem 0 1.5rem;
  max-width: 38rem;
  color: #cbd5e1;
  line-height: 1.65;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
  padding: 0 1.15rem;
  border-radius: 0.7rem;
  font-weight: 700;
  text-decoration: none;
}
.btn-primary {
  background: #14b8a6;
  color: #042f2e;
}
.btn-ghost {
  border: 1px solid rgba(226, 232, 240, 0.35);
  color: #f8fafc;
}
.hint {
  margin-top: 1rem;
  color: #94a3b8;
  font-size: 0.9rem;
}
.panel {
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 1rem;
  padding: 1.35rem 1.4rem;
  backdrop-filter: blur(8px);
}
.panel h2 {
  margin: 0 0 0.85rem;
  font-size: 1.05rem;
}
.panel ul {
  margin: 0;
  padding-left: 1.1rem;
  display: grid;
  gap: 0.75rem;
  color: #cbd5e1;
  line-height: 1.45;
}
.modules {
  padding: 0 0 3.5rem;
}
.modules h2 {
  margin: 0 0 1rem;
  font-size: 1.2rem;
}
.module-grid {
  display: grid;
  gap: 0.9rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}
.module-grid article {
  background: rgba(15, 23, 42, 0.45);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 0.9rem;
  padding: 1rem;
}
.module-grid h3 {
  margin: 0 0 0.45rem;
  font-size: 0.98rem;
  color: #f8fafc;
}
.module-grid p {
  margin: 0;
  color: #94a3b8;
  font-size: 0.88rem;
  line-height: 1.5;
}
@media (max-width: 960px) {
  .hero-grid,
  .module-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 640px) {
  .actions {
    flex-direction: column;
  }
  .btn {
    width: 100%;
  }
}
</style>
