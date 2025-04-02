import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: process.env.NODE_ENV === 'production' ? '/ui-chat/' : '/',
  server: {
    proxy: {
      '/api': {
        target: 'http://10.10.160.23:18280',
        changeOrigin: true
      }
    }
  }
})
