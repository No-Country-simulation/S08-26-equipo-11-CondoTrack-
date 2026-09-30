import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'


path.resolve('./src')
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    port: 5173,
  },
  resolve: {
    alias: {
      '@' : path.resolve('./src')

    }
  }
})
