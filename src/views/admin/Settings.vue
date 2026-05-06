<template>
  <div class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h4">Settings</div>
    </div>

    <div class="row q-col-gutter-md">

      <!-- ── Platform Settings ─────────────────────────────────── -->
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section class="row items-center q-pb-xs">
            <q-icon name="settings" size="sm" color="primary" class="q-mr-sm" />
            <span class="text-h6">Platform Settings</span>
          </q-card-section>
          <q-separator />
          <q-card-section class="q-gutter-md">
            <q-input v-model="platform.siteName" label="Site Name" outlined dense />
            <q-input v-model="platform.adminEmail" label="Admin Email" type="email" outlined dense />
            <q-input v-model="platform.supportEmail" label="Support Email" type="email" outlined dense />
            <q-input v-model="platform.timezone" label="Timezone" outlined dense />
            <q-input v-model="platform.currency" label="Default Currency" outlined dense />
            <div class="row items-center justify-between">
              <span class="text-body2">Maintenance Mode</span>
              <q-toggle v-model="platform.maintenanceMode" color="negative" />
            </div>
            <div class="row items-center justify-between">
              <span class="text-body2">User Registration</span>
              <q-toggle v-model="platform.registrationEnabled" color="primary" />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="q-pr-md q-pb-md">
            <q-btn unelevated color="primary" label="Save Platform" icon="save" :loading="saving.platform" @click="savePlatform" />
          </q-card-actions>
        </q-card>
      </div>

      <!-- ── Payment Settings ──────────────────────────────────── -->
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section class="row items-center q-pb-xs">
            <q-icon name="payment" size="sm" color="green" class="q-mr-sm" />
            <span class="text-h6">Payment Settings</span>
          </q-card-section>
          <q-separator />
          <q-card-section class="q-gutter-md">
            <div class="row items-center justify-between">
              <div>
                <div class="text-body2 text-weight-medium">Stripe Integration</div>
                <div class="text-caption text-grey-6">Accept card payments via Stripe</div>
              </div>
              <q-toggle v-model="payment.stripeEnabled" color="positive" />
            </div>
            <q-input v-if="payment.stripeEnabled" v-model="payment.stripeKey" label="Stripe Publishable Key" outlined dense type="password" />
            <q-separator spaced />
            <div class="row items-center justify-between">
              <div>
                <div class="text-body2 text-weight-medium">PayPal Integration</div>
                <div class="text-caption text-grey-6">Accept payments via PayPal</div>
              </div>
              <q-toggle v-model="payment.paypalEnabled" color="positive" />
            </div>
            <q-input v-if="payment.paypalEnabled" v-model="payment.paypalClientId" label="PayPal Client ID" outlined dense type="password" />
            <q-separator spaced />
            <q-input v-model.number="payment.commissionRate" label="Platform Commission Rate (%)" type="number" outlined dense suffix="%" :rules="[v => v >= 0 && v <= 100 || 'Must be 0–100']" />
            <q-input v-model.number="payment.minWithdrawal" label="Minimum Withdrawal (PKR)" type="number" outlined dense />
          </q-card-section>
          <q-card-actions align="right" class="q-pr-md q-pb-md">
            <q-btn unelevated color="green" label="Save Payment" icon="save" :loading="saving.payment" @click="savePayment" />
          </q-card-actions>
        </q-card>
      </div>

      <!-- ── Notification Settings ─────────────────────────────── -->
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section class="row items-center q-pb-xs">
            <q-icon name="notifications" size="sm" color="orange" class="q-mr-sm" />
            <span class="text-h6">Notification Settings</span>
          </q-card-section>
          <q-separator />
          <q-card-section class="q-gutter-sm">
            <div v-for="n in notificationToggles" :key="n.key" class="row items-center justify-between q-py-xs">
              <div>
                <div class="text-body2 text-weight-medium">{{ n.label }}</div>
                <div class="text-caption text-grey-6">{{ n.hint }}</div>
              </div>
              <q-toggle v-model="notifications[n.key]" color="orange" />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="q-pr-md q-pb-md">
            <q-btn unelevated color="orange" text-color="white" label="Save Notifications" icon="save" :loading="saving.notifications" @click="saveNotifications" />
          </q-card-actions>
        </q-card>
      </div>

      <!-- ── Security Settings ─────────────────────────────────── -->
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section class="row items-center q-pb-xs">
            <q-icon name="security" size="sm" color="red" class="q-mr-sm" />
            <span class="text-h6">Security Settings</span>
          </q-card-section>
          <q-separator />
          <q-card-section class="q-gutter-md">
            <q-input v-model.number="security.sessionTimeout" label="Session Timeout (minutes)" type="number" outlined dense />
            <q-input v-model.number="security.maxLoginAttempts" label="Max Login Attempts" type="number" outlined dense />
            <q-input v-model.number="security.lockoutDuration" label="Lockout Duration (minutes)" type="number" outlined dense />
            <div class="row items-center justify-between">
              <div>
                <div class="text-body2 text-weight-medium">Two-Factor Authentication</div>
                <div class="text-caption text-grey-6">Require 2FA for admin accounts</div>
              </div>
              <q-toggle v-model="security.twoFactorEnabled" color="red" />
            </div>
            <div class="row items-center justify-between">
              <div>
                <div class="text-body2 text-weight-medium">Force HTTPS</div>
                <div class="text-caption text-grey-6">Redirect all HTTP traffic to HTTPS</div>
              </div>
              <q-toggle v-model="security.forceHttps" color="red" />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="q-pr-md q-pb-md">
            <q-btn unelevated color="red" label="Save Security" icon="save" :loading="saving.security" @click="saveSecurity" />
          </q-card-actions>
        </q-card>
      </div>

      <!-- ── Seller Settings ───────────────────────────────────── -->
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section class="row items-center q-pb-xs">
            <q-icon name="storefront" size="sm" color="purple" class="q-mr-sm" />
            <span class="text-h6">Seller Settings</span>
          </q-card-section>
          <q-separator />
          <q-card-section class="q-gutter-md">
            <div class="row items-center justify-between">
              <div>
                <div class="text-body2 text-weight-medium">Auto-Approve Sellers</div>
                <div class="text-caption text-grey-6">New seller accounts approved automatically</div>
              </div>
              <q-toggle v-model="seller.autoApprove" color="purple" />
            </div>
            <div class="row items-center justify-between">
              <div>
                <div class="text-body2 text-weight-medium">Auto-Approve Products</div>
                <div class="text-caption text-grey-6">New products go live without review</div>
              </div>
              <q-toggle v-model="seller.autoApproveProducts" color="purple" />
            </div>
            <q-input v-model.number="seller.maxProducts" label="Max Products per Seller" type="number" outlined dense />
            <q-input v-model.number="seller.maxImages" label="Max Images per Product" type="number" outlined dense />
          </q-card-section>
          <q-card-actions align="right" class="q-pr-md q-pb-md">
            <q-btn unelevated color="purple" label="Save Seller Settings" icon="save" :loading="saving.seller" @click="saveSeller" />
          </q-card-actions>
        </q-card>
      </div>

      <!-- ── Order Settings ────────────────────────────────────── -->
      <div class="col-12 col-md-6">
        <q-card flat bordered>
          <q-card-section class="row items-center q-pb-xs">
            <q-icon name="shopping_cart" size="sm" color="cyan-8" class="q-mr-sm" />
            <span class="text-h6">Order Settings</span>
          </q-card-section>
          <q-separator />
          <q-card-section class="q-gutter-md">
            <q-input v-model.number="order.cancelWindow" label="Order Cancel Window (hours)" type="number" outlined dense />
            <q-input v-model.number="order.returnWindow" label="Return Window (days)" type="number" outlined dense />
            <q-input v-model.number="order.minOrderAmount" label="Minimum Order Amount (PKR)" type="number" outlined dense />
            <div class="row items-center justify-between">
              <div>
                <div class="text-body2 text-weight-medium">Guest Checkout</div>
                <div class="text-caption text-grey-6">Allow orders without account</div>
              </div>
              <q-toggle v-model="order.guestCheckout" color="cyan-8" />
            </div>
            <div class="row items-center justify-between">
              <div>
                <div class="text-body2 text-weight-medium">Auto-Complete Orders</div>
                <div class="text-caption text-grey-6">Mark delivered orders as complete after 7 days</div>
              </div>
              <q-toggle v-model="order.autoComplete" color="cyan-8" />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="q-pr-md q-pb-md">
            <q-btn unelevated color="cyan-8" label="Save Order Settings" icon="save" :loading="saving.order" @click="saveOrder" />
          </q-card-actions>
        </q-card>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// ── Platform ──────────────────────────────────────────────────────────────────
const platform = reactive({
  siteName:            'E-Commerce Admin',
  adminEmail:          'admin@example.com',
  supportEmail:        'support@example.com',
  timezone:            'Asia/Karachi',
  currency:            'PKR',
  maintenanceMode:     false,
  registrationEnabled: true,
})

// ── Payment ───────────────────────────────────────────────────────────────────
const payment = reactive({
  stripeEnabled:  true,
  stripeKey:      '',
  paypalEnabled:  true,
  paypalClientId: '',
  commissionRate: 5,
  minWithdrawal:  1000,
})

// ── Notifications ─────────────────────────────────────────────────────────────
const notifications = reactive({
  newOrder:        true,
  orderStatusChange: true,
  newSeller:       true,
  newProduct:      false,
  lowStock:        true,
  paymentFailed:   true,
  refundRequest:   true,
})

const notificationToggles = [
  { key: 'newOrder',          label: 'New Order',           hint: 'Alert when a new order is placed' },
  { key: 'orderStatusChange', label: 'Order Status Change', hint: 'Alert when order status updates' },
  { key: 'newSeller',         label: 'New Seller',          hint: 'Alert when a seller registers' },
  { key: 'newProduct',        label: 'New Product',         hint: 'Alert when a product is added' },
  { key: 'lowStock',          label: 'Low Stock Alert',     hint: 'Alert when stock falls below threshold' },
  { key: 'paymentFailed',     label: 'Payment Failed',      hint: 'Alert on failed payment attempts' },
  { key: 'refundRequest',     label: 'Refund Request',      hint: 'Alert when a refund is requested' },
]

// ── Security ──────────────────────────────────────────────────────────────────
const security = reactive({
  sessionTimeout:   120,
  maxLoginAttempts: 5,
  lockoutDuration:  30,
  twoFactorEnabled: false,
  forceHttps:       true,
})

// ── Seller ────────────────────────────────────────────────────────────────────
const seller = reactive({
  autoApprove:        false,
  autoApproveProducts: false,
  maxProducts:        500,
  maxImages:          10,
})

// ── Order ─────────────────────────────────────────────────────────────────────
const order = reactive({
  cancelWindow:   24,
  returnWindow:   7,
  minOrderAmount: 200,
  guestCheckout:  true,
  autoComplete:   true,
})

// ── Save handlers ─────────────────────────────────────────────────────────────
const saving = reactive({ platform: false, payment: false, notifications: false, security: false, seller: false, order: false })

function notify(section) {
  $q.notify({ type: 'positive', message: `${section} settings saved successfully`, position: 'top', timeout: 2000 })
}

async function savePlatform()      { saving.platform = true;      await delay(); saving.platform = false;      notify('Platform') }
async function savePayment()       { saving.payment = true;       await delay(); saving.payment = false;       notify('Payment') }
async function saveNotifications() { saving.notifications = true; await delay(); saving.notifications = false; notify('Notification') }
async function saveSecurity()      { saving.security = true;      await delay(); saving.security = false;      notify('Security') }
async function saveSeller()        { saving.seller = true;        await delay(); saving.seller = false;        notify('Seller') }
async function saveOrder()         { saving.order = true;         await delay(); saving.order = false;         notify('Order') }

const delay = (ms = 600) => new Promise(r => setTimeout(r, ms))
</script>
