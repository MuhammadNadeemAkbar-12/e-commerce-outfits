import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  plugins: [
    vue({
      template: { transformAssetUrls },
      compilerOptions: {
        plugins: ['@babel/plugin-proposal-decorators', { legacy: true }]
      }
    }),
    quasar({
      sassVariables: resolve(__dirname, 'src/quasar-variables.sass')
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'src': resolve(__dirname, 'src')
    }
  }
})
