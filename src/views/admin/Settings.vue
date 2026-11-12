<template>
  <div class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h4">System Settings</div>
        <div class="text-body2 text-grey-7">
          Read-only business configuration. Security and access control are enforced by the Laravel API (Sanctum + Spatie roles), not by toggles on this page.
        </div>
      </div>
    </div>

    <q-banner class="bg-blue-1 text-primary q-mb-md" rounded dense>
      <template #avatar><q-icon name="info" color="primary" /></template>
      Changes to authentication, HTTPS, backups, and role permissions are applied in application configuration and code — not via fake UI saves.
    </q-banner>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section class="row items-center q-pb-xs">
            <q-icon name="business" size="sm" color="primary" class="q-mr-sm" />
            <span class="text-h6">Business Identity</span>
          </q-card-section>
          <q-separator />
          <q-card-section class="q-gutter-sm">
            <q-item dense>
              <q-item-section>
                <q-item-label>Application</q-item-label>
                <q-item-label caption>Web-based Stock, Inventory and Sales Management System</q-item-label>
              </q-item-section>
            </q-item>
            <q-item dense>
              <q-item-section>
                <q-item-label>Display name</q-item-label>
                <q-item-label caption>{{ info.siteName }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item dense>
              <q-item-section>
                <q-item-label>Currency</q-item-label>
                <q-item-label caption>{{ info.currency }} (Pakistani Rupees)</q-item-label>
              </q-item-section>
            </q-item>
            <q-item dense>
              <q-item-section>
                <q-item-label>Timezone</q-item-label>
                <q-item-label caption>{{ info.timezone }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section class="row items-center q-pb-xs">
            <q-icon name="security" size="sm" color="negative" class="q-mr-sm" />
            <span class="text-h6">Security (enforced)</span>
          </q-card-section>
          <q-separator />
          <q-card-section class="q-gutter-sm">
            <q-item dense v-for="row in securityRows" :key="row.label">
              <q-item-section>
                <q-item-label>{{ row.label }}</q-item-label>
                <q-item-label caption>{{ row.value }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge color="positive" outline>Active</q-badge>
              </q-item-section>
            </q-item>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section class="row items-center q-pb-xs">
            <q-icon name="group" size="sm" color="secondary" class="q-mr-sm" />
            <span class="text-h6">Staff roles</span>
          </q-card-section>
          <q-separator />
          <q-card-section class="q-gutter-sm">
            <q-item dense v-for="role in roles" :key="role.name">
              <q-item-section>
                <q-item-label>{{ role.name }}</q-item-label>
                <q-item-label caption>{{ role.desc }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section class="row items-center q-pb-xs">
            <q-icon name="inventory_2" size="sm" color="orange" class="q-mr-sm" />
            <span class="text-h6">Inventory channel</span>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <div class="text-body2">
              Stock mutations for the BMS flow through purchases, sales invoices, and approved returns.
              Legacy storefront checkout does not deduct inventory when
              <code>INVENTORY_STOCK_CHANNEL=invoices</code>.
            </div>
            <div class="text-caption text-grey-7 q-mt-sm">
              Low-stock alerts, activity logs, and database backups are managed from their dedicated Admin modules.
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
const info = {
  siteName: 'Stock Inventory & Sales',
  currency: 'PKR',
  timezone: 'Asia/Karachi',
}

const securityRows = [
  { label: 'API authentication', value: 'Laravel Sanctum bearer tokens' },
  { label: 'Authorization', value: 'Spatie roles: admin, manager, salesman' },
  { label: 'Password storage', value: 'Hashed with bcrypt via Laravel Hash' },
  { label: 'Input validation', value: 'Form requests + server-side business rules' },
]

const roles = [
  { name: 'Admin', desc: 'Full system: users, inventory, purchases, sales, reports, backups, activity logs' },
  { name: 'Manager', desc: 'Business operations: inventory, purchases, sales, customers, suppliers, returns, reports' },
  { name: 'Salesman', desc: 'Sales operations: customers, invoices, sales history, related lookups' },
]
</script>
