import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { configDefaults, defineConfig } from 'vitest/config'
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
    environmentMatchGlobs: [['src/infra/http/controllers/**', 'prisma']],
    globals: true,
    exclude: [
      ...configDefaults.exclude,
      '**/*.e2e-{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
  },
})