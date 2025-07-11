import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/common': path.resolve(__dirname, './src/common'),
      '@/global': path.resolve(__dirname, './src/global'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/shared': path.resolve(__dirname, './src/shared'),
      '@/domain': path.resolve(__dirname, './src/domain'),
      '@/feature': path.resolve(__dirname, './src/feature'),
      '@/routes': path.resolve(__dirname, './src/routes'),
      '@/types': path.resolve(__dirname, './src/types'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 도메인별 청크 분리
          'domain-user': ['./src/domain/user'],
          'domain-product': ['./src/domain/product'],
          'domain-order': ['./src/domain/order'],
          
          // 라이브러리별 청크 분리
          vendor: ['react', 'react-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-router': ['react-router-dom'],
          
          // 공통 모듈
          shared: ['./src/shared'],
          services: ['./src/services'],
        }
      }
    },
    sourcemap: true,
    minify: 'terser',
    target: 'es2020'
  },
  server: {
    port: 3000,
    open: true
  },
  preview: {
    port: 3001
  }
})