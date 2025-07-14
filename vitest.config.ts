import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts',
        '**/.gitkeep'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    globals: true
  },
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
})