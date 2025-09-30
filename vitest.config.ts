import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Avoid Vite CSS/PostCSS pipeline; we don't need it for DB tests
  css: {
    postcss: {
      plugins: [],
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules/**'],
    passWithNoTests: false,
  },
})
