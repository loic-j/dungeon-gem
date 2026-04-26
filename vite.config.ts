import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    environment: 'node',
    exclude: ['tests/**', 'node_modules/**'],
  },
})
