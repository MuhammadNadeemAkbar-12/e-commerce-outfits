import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomePage from '../views/home/HomePage.vue'
import Contact from '../views/home/Contact.vue'


const routes = [
  // Home routes
  {
    path: '/',
    name: 'HomePage',
    component: HomePage,
  },

  {
    path: '/contact',
    component: Contact,
  },


  // Unified admin routes - accessible through main login
  {
    path: '/admin',
    component: () => import('@/components/admin/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresRole: 'admin' },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard',
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
      },
      {
        path: 'users',
        name: 'ManageUsers',
        component: () => import('@/views/admin/Users.vue'),
      },
      {
        path: 'sellers',
        name: 'ManageSellers',
        component: () => import('@/views/admin/Sellers.vue'),
      },
      {
        path: 'products',
        name: 'AllProducts',
        component: () => import('@/views/admin/Products.vue'),
      },
      {
        path: 'product-approval',
        name: 'ProductApproval',
        component: () => import('@/views/admin/ProductApproval.vue'),
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('@/views/admin/Categories.vue'),
      },
      {
        path: 'orders',
        name: 'AllOrders',
        component: () => import('@/views/admin/Orders.vue'),
      },
      {
        path: 'customer-orders',
        name: 'AdminCustomerOrders',
        component: () => import('@/views/admin/CustomerOrders.vue'),
      },
      {
        path: 'seller-orders',
        name: 'SellerOrders',
        component: () => import('@/views/admin/SellerOrders.vue'),
      },
      {
        path: 'seller-products',
        name: 'SellerProductsList',
        component: () => import('@/views/admin/SellerProducts.vue'),
      },
      {
        path: 'sellers/:sellerId/products',
        name: 'SellerProducts',
        component: () => import('@/views/admin/SellerProducts.vue'),
        props: true,
      },
      {
        path: 'returns-refunds',
        name: 'ReturnsRefunds',
        component: () => import('@/views/admin/ReturnsRefunds.vue'),
      },
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('@/views/admin/Reports.vue'),
      },
      {
        path: 'platform-stats',
        name: 'PlatformStats',
        component: () => import('@/views/admin/PlatformStats.vue'),
      },
      {
        path: 'invoices',
        name: 'AdminInvoices',
        component: () => import('@/views/admin/Invoices.vue'),
      },
      {
        path: 'stock-movements',
        name: 'AdminStockMovements',
        component: () => import('@/views/admin/StockMovements.vue'),
      },
      {
        path: 'biz-customers',
        name: 'AdminBizCustomers',
        component: () => import('@/views/admin/BizCustomers.vue'),
      },
      {
        path: 'suppliers',
        name: 'AdminSuppliers',
        component: () => import('@/views/admin/Suppliers.vue'),
      },
      {
        path: 'audit-logs',
        name: 'AdminAuditLogs',
        component: () => import('@/views/admin/AuditLogs.vue'),
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/admin/Settings.vue'),
      },
    ],
  },

  // Manager routes (formerly seller)
  {
    path: '/seller',
    component: () => import('@/views/seller/SellerLayout.vue'),
    meta: { requiresAuth: true, requiresRole: ['seller', 'manager'] },
    children: [
      {
        path: '',
        redirect: '/seller/dashboard',
      },
      {
        path: 'dashboard',
        name: 'SellerDashboard',
        component: () => import('@/views/seller/SellerDashboard.vue'),
        meta: { requiresAuth: true, requiresRole: ['seller', 'manager'] }
      },
      {
        path: 'products',
        name: 'SellerProducts',
        component: () => import('@/views/seller/ProductForm.vue'),
        meta: { requiresAuth: true, requiresRole: ['seller', 'manager'] }
      },
      {
        path: 'products/add',
        name: 'AddProduct',
        component: () => import('@/views/seller/ProductForm.vue'),
        meta: { requiresAuth: true, requiresRole: ['seller', 'manager'] }
      },
      {
        path: 'orders',
        name: 'SellerOrdersPanel',
        component: () => import('@/views/seller/OrderManagement.vue'),
        meta: { requiresAuth: true, requiresRole: ['seller', 'manager'] }
      },
      {
        path: 'stock', name: 'SellerStock', component: () => import('@/views/seller/UpdateStock.vue'),
        meta: { requiresAuth: true, requiresRole: ['seller', 'manager'] }
      },
      {
        path: 'invoices',
        name: 'SellerInvoices',
        component: () => import('@/views/seller/Invoices.vue'),
        meta: { requiresAuth: true, requiresRole: ['seller', 'manager'] }
      },
      {
        path: 'invoices/create',
        name: 'CreateInvoice',
        component: () => import('@/views/seller/InvoiceCreate.vue'),
        meta: { requiresAuth: true, requiresRole: ['seller', 'manager'] }
      },
        {
          path: 'stock-ledger',
          name: 'StockLedger',
          component: () => import('@/views/seller/StockLedger.vue'),
          meta: { requiresAuth: true, requiresRole: ['seller', 'manager'] }
        },
        {
          path: 'returns',
          name: 'SaleReturns',
          component: () => import('@/views/seller/Returns.vue'),
          meta: { requiresAuth: true, requiresRole: ['seller', 'manager'] }
        },
        {
          path: 'returns/create',
          name: 'ReturnCreate',
          component: () => import('@/views/seller/ReturnCreate.vue'),
          meta: { requiresAuth: true, requiresRole: ['seller', 'manager'] }
        },
        {
          path: 'invoices/:id/print',
          name: 'InvoicePrint',
          component: () => import('@/views/seller/InvoicePrint.vue'),
          meta: { requiresAuth: true, requiresRole: ['seller', 'manager'] }
        },
        {
          path: 'customers',
          name: 'BizCustomers',
          component: () => import('@/views/seller/Customers.vue'),
          meta: { requiresAuth: true, requiresRole: ['seller', 'manager'] }
        },
        {
          path: 'suppliers',
          name: 'SellerSuppliers',
          component: () => import('@/views/seller/Suppliers.vue'),
          meta: { requiresAuth: true, requiresRole: ['seller', 'manager'] }
        },
        {
          path: 'reports',
          name: 'SellerReports',
          component: () => import('@/views/seller/Reports.vue'),
          meta: { requiresAuth: true, requiresRole: ['seller', 'manager'] }
        },
        {
          path: 'audit-logs',
          name: 'SellerAuditLogs',
          component: () => import('@/views/seller/AuditLogs.vue'),
          meta: { requiresAuth: true, requiresRole: ['seller', 'manager'] }
        },
        {
        path: 'settings',
        name: 'SellerSettings',
        component: () => import('@/views/seller/SellerStats.vue'),
        meta: { requiresAuth: true, requiresRole: ['seller', 'manager'] }
      },
      {
        path: 'profile',
        component: () => import('@/views/seller/Profile.vue'),
        meta: { requiresAuth: true, requiresRole: ['seller', 'manager'] }
      }
    ]
  },

  // Buyer routes
  {
    path: '/buyer',
    redirect: '/buyer/dashboard',
    meta: { requiresAuth: true, requiresRole: 'buyer' }
  },
  {
    path: '/buyer/dashboard',
    name: 'BuyerDashboard',
    component: () => import('@/views/home/HomePage.vue'),
    meta: { requiresAuth: true, requiresRole: 'buyer' }
  },

  //Coustomer Routes
  {
    path: '/customer/profile',
    name: 'CustomerProfile',
    component: () => import('@/views/customer/CustomerProfile.vue'),
    meta: { requiresAuth: true } // optional
  },
  {
    path: '/customer/orders',
    name: 'CustomerOrders',
    component: () => import('@/views/customer/CustomerOrders.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('@/views/customer/Checkout.vue')
  },

  // User authentication routes
  {
    path: '/registeruser',
    name: 'RegisterUser',
    component: () => import('@/components/auth/RegisterUser.vue'),
  },
  {
    path: '/loginuser',
    name: 'LoginUser',
    component: () => import('@/components/auth/LoginUser.vue'),
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('@/views/admin/AdminLogin.vue'),
    meta: { requiresGuest: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Check and restore authentication state from localStorage
  if (!authStore.isLoggedIn) {
    authStore.checkAuth()
  }

  // Allow home page to be accessed without any checks
  if (to.path === '/') {
    next()
    return
  }

  // Handle authentication requirements
  if (to.meta.requiresAuth) {
    if (!authStore.isLoggedIn) {
      next('/loginuser')
      return
    }

    // Handle role-based access
    if (to.meta.requiresRole) {
      const requiredRoles = Array.isArray(to.meta.requiresRole)
        ? to.meta.requiresRole
        : [to.meta.requiresRole]
      const userRole = authStore.role

      if (!requiredRoles.includes(userRole)) {
        // Redirect based on actual role
        if (userRole === 'admin') {
          next('/admin/dashboard')
        } else if (userRole === 'seller' || userRole === 'manager') {
          next('/seller/dashboard')
        } else if (userRole === 'buyer' || userRole === 'customer' || userRole === 'salesman') {
          next('/')
        } else {
          next('/')
        }
        return
      }
    }
  }

  // Redirect logged-in users away from login/register
  if ((to.path === '/loginuser' || to.path === '/registeruser' || to.path === '/admin/login') && authStore.isLoggedIn) {
    const r = authStore.role
    if (r === 'admin') next('/admin/dashboard')
    else if (r === 'seller' || r === 'manager') next('/seller/dashboard')
    else if (r === 'salesman') next('/customer/orders')
    else next('/')
    return
  }

  next()
})

export default router
