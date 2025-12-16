import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
      test: path.resolve(rootDir, 'test'),
    },
  },
  test: {
    dir: 'src',
    include: ['**/*.e2e-spec.ts'],
    globals: true,
    environment: 'node',
    restoreMocks: true,
  },
})
