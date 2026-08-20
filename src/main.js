import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'


// Quasar styles (must be imported first)
import 'quasar/src/css/index.sass'
import '@quasar/extras/material-icons/material-icons.css'

// Tailwind CSS (import after Quasar base styles)
import './assets/main.css'
import './assets/premium-system.css'

// Quasar
import { Quasar, Notify, Dialog } from 'quasar'

const app = createApp(App)
const pinia = createPinia()

// If a token is persisted in localStorage, hydrate the auth store so the
// session survives page refreshes. We import the store after pinia is created.
import { useAuthStore } from '@/stores/auth'


app.use(Quasar, {
  plugins: { Notify, Dialog },
  config: {
    brand: {
      primary: '#315f55',
      secondary: '#987454',
      accent: '#536878',
      positive: '#2f7d5e',
      negative: '#b14b43',
      info: '#39708a',
      warning: '#b7791f'
    }
  }
})

app.use(pinia)
app.use(router)

// Hydrate auth state from persisted token (if any)
try {
  const authStore = useAuthStore(pinia)
  if (typeof authStore.checkAuth === 'function') {
    const ok = authStore.checkAuth()
    if (ok && typeof authStore.hydrateUserProfile === 'function') {
      // Run async but don't block mount; avatar/menu will update when resolved
      authStore.hydrateUserProfile()
    }
  }
} catch (e) {
  // ignore
}

app.mount('#app')
