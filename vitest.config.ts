import { defineConfig } from 'vitest/config'
import path from 'path'
import { fileURLToPath } from 'url'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': rootDir,
      '@/': rootDir,
      'contentlayer/generated': path.join(rootDir, '.contentlayer/generated'),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    coverage: {
      enabled: false,
    },
  },
})
