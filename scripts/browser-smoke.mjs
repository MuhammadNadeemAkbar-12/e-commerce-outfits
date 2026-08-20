#!/usr/bin/env node

const debugUrl = process.env.CHROME_DEBUG_URL || 'http://127.0.0.1:9333'
const appUrl = (process.env.QA_APP_URL || 'http://127.0.0.1:5174').replace(/\/$/, '')
const apiUrl = (process.env.QA_API_URL || 'http://127.0.0.1:8001/api').replace(/\/$/, '')
const role = process.env.QA_ROLE || 'public'
const email = process.env.QA_EMAIL
const password = process.env.QA_PASSWORD
const navigationDelay = Number(process.env.QA_DELAY_MS || 1200)
const responsiveWidths = (process.env.QA_WIDTHS || '320,375,390,414,768,1024,1366,1920')
  .split(',')
  .map((value) => Number(value.trim()))
  .filter((value) => Number.isInteger(value) && value > 0)
const fullRouteWidths = (process.env.QA_ROUTE_WIDTHS || '390,1366')
  .split(',')
  .map((value) => Number(value.trim()))
  .filter((value) => Number.isInteger(value) && value > 0)

const routeSets = {
  public: ['/', '/contact', '/loginuser', '/registeruser', '/password-recovery', '/admin/login'],
  admin: [
    '/admin/dashboard', '/admin/users', '/admin/sellers', '/admin/products', '/admin/product-approval',
    '/admin/categories', '/admin/orders', '/admin/customer-orders', '/admin/seller-orders',
    '/admin/seller-products', '/admin/returns-refunds', '/admin/sale-returns', '/admin/reports',
    '/admin/platform-stats', '/admin/invoices', '/admin/stock-movements', '/admin/biz-customers',
    '/admin/suppliers', '/admin/purchases', '/admin/audit-logs', '/admin/backups', '/admin/settings',
  ],
  manager: [
    '/seller/dashboard', '/seller/products', '/seller/products/add', '/seller/orders', '/seller/stock',
    '/seller/invoices', '/seller/invoices/create', '/seller/stock-ledger', '/seller/returns',
    '/seller/returns/create', '/seller/customers', '/seller/suppliers', '/seller/purchases',
    '/seller/reports', '/seller/settings', '/seller/profile',
  ],
  salesman: [
    '/sales/invoices', '/sales/invoices/create', '/sales/customers', '/sales/returns', '/sales/returns/create',
  ],
  customer: ['/customer/profile', '/customer/orders', '/customer/returns', '/checkout'],
}
const responsiveCoreRoute = { public: '/', admin: '/admin/dashboard', manager: '/seller/dashboard', salesman: '/sales/invoices', customer: '/customer/orders' }
const forbidden = {
  public: '/checkout',
  admin: '/seller/dashboard',
  manager: '/admin/backups',
  salesman: '/seller/purchases',
  customer: '/sales/invoices',
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const target = await fetch(`${debugUrl}/json/new?${encodeURIComponent('about:blank')}`, { method: 'PUT' }).then((response) => response.json())
const socket = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject })

let id = 0
const pending = new Map()
const runtimeErrors = []
const networkFailures = []
socket.onmessage = ({ data }) => {
  const message = JSON.parse(data)
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id)
    pending.delete(message.id)
    message.error ? reject(new Error(message.error.message)) : resolve(message.result)
  }
  if (message.method === 'Runtime.exceptionThrown') runtimeErrors.push(
    message.params.exceptionDetails?.exception?.description || message.params.exceptionDetails?.text || 'Runtime exception'
  )
  if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
    runtimeErrors.push(message.params.args?.map((arg) => arg.value || arg.description).join(' ') || 'Console error')
  }
  if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) {
    networkFailures.push({ status: message.params.response.status, url: message.params.response.url })
  }
}

function send(method, params = {}) {
  const requestId = ++id
  socket.send(JSON.stringify({ id: requestId, method, params }))
  return new Promise((resolve, reject) => pending.set(requestId, { resolve, reject }))
}

async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  return result.result?.value
}

async function navigate(path, width) {
  await send('Emulation.setDeviceMetricsOverride', { width, height: width < 600 ? 844 : 900, deviceScaleFactor: 1, mobile: width < 600 })
  await send('Page.navigate', { url: `${appUrl}${path}` })
  await sleep(navigationDelay)
  return evaluate(`({
    requested: ${JSON.stringify(path)},
    current: location.pathname,
    title: document.title,
    textLength: (document.body?.innerText || '').trim().length,
    overflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
    lowStockButton: Boolean(document.querySelector('[aria-label*="low-stock" i]'))
  })`)
}

await send('Page.enable')
await send('Runtime.enable')
await send('Network.enable')

await send('Page.navigate', { url: appUrl })
await sleep(700)
await evaluate(`(() => { localStorage.clear(); sessionStorage.clear() })()`)

let token
if (role !== 'public') {
  if (!email || !password) throw new Error('QA_EMAIL and QA_PASSWORD are required for authenticated roles')
  const loginPath = role === 'admin' ? '/admin/login' : '/login'
  const response = await fetch(`${apiUrl}${loginPath}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const body = await response.json().catch(() => ({}))
  token = body?.data?.token
  if (!response.ok || !token) throw new Error(`Login failed with HTTP ${response.status}`)
  const user = { ...(body?.data?.user || {}), role }
  await evaluate(`(() => {
    localStorage.setItem('token', ${JSON.stringify(token)});
    localStorage.setItem('role', ${JSON.stringify(role)});
    localStorage.setItem('user', ${JSON.stringify(JSON.stringify(user))});
  })()`)
}

const results = []
const navigationMatrix = new Map()
for (const width of fullRouteWidths) {
  for (const path of routeSets[role]) navigationMatrix.set(`${width}|${path}`, { width, path })
}
for (const width of responsiveWidths) {
  const path = responsiveCoreRoute[role]
  navigationMatrix.set(`${width}|${path}`, { width, path })
}
for (const { width, path } of navigationMatrix.values()) results.push({ width, ...await navigate(path, width) })
if (forbidden[role]) results.push({ width: 1366, unauthorizedProbe: true, ...await navigate(forbidden[role], 1366) })

let publicWorkflow
if (role === 'public') {
  await navigate('/', 1366)
  publicWorkflow = await evaluate(`(async () => {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    await sleep(${navigationDelay});
    const categoryCount = document.querySelectorAll('.category-card:not(.category-card--skeleton)').length;
    const initialProductCount = document.querySelectorAll('.product-card:not(.product-card--skeleton)').length;
    document.querySelector('.product-view')?.click();
    await sleep(250);
    const productDetailOpened = Boolean(document.querySelector('#product-dialog-title'));
    document.querySelector('[aria-label="Close product details"]')?.click();
    document.querySelector('.product-card .button--compact:not(:disabled)')?.click();
    await sleep(250);
    const guestCartItems = JSON.parse(localStorage.getItem('stylehub_cart_items') || '[]').length;
    const searchButton = [...document.querySelectorAll('button')].find((button) => button.textContent.trim() === 'Search');
    searchButton?.click();
    await sleep(50);
    const input = document.querySelector('input[placeholder*="Search for products"]');
    if (input) {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(input, 'Smartphone');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', bubbles: true }));
    }
    await sleep(${navigationDelay});
    return {
      categoryCount,
      initialProductCount,
      productDetailOpened,
      guestCartItems,
      searchQuery: new URLSearchParams(location.search).get('search'),
      searchResultHeading: document.querySelector('#products-title')?.textContent.trim() || '',
      filteredProductCount: document.querySelectorAll('.product-card:not(.product-card--skeleton)').length,
    };
  })()`)
}

if (token) {
  await fetch(`${apiUrl}/logout`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }).catch(() => {})
}
await fetch(`${debugUrl}/json/close/${target.id}`).catch(() => {})
socket.close()

const failures = results.filter((result) => result.textLength < 20 || result.overflow > 2 || (result.unauthorizedProbe && result.current === result.requested))
if (role === 'public' && (!publicWorkflow || publicWorkflow.categoryCount < 1 || publicWorkflow.initialProductCount < 1 || !publicWorkflow.productDetailOpened || publicWorkflow.guestCartItems < 1 || publicWorkflow.searchQuery !== 'Smartphone' || publicWorkflow.filteredProductCount !== 1)) {
  failures.push({ reason: 'Public product/category/detail/search/cart workflow failed', publicWorkflow })
}
const alertExpected = ['admin', 'manager'].includes(role)
if (alertExpected && !results.filter((result) => !result.unauthorizedProbe).some((result) => result.lowStockButton)) failures.push({ reason: 'Low-stock alert button not rendered' })

console.log(JSON.stringify({ role, responsiveWidths, fullRouteWidths, results, publicWorkflow, runtimeErrors: [...new Set(runtimeErrors)], networkFailures, failures }, null, 2))
if (failures.length || runtimeErrors.length) process.exitCode = 1
