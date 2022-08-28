import * as path from 'path'
import { defineConfig, Plugin } from 'vite'
import topLevelAwait from 'vite-plugin-top-level-await'
import viteTsconfigPaths from 'vite-tsconfig-paths'

import pkg from './package.json'

export default defineConfig({
  plugins: [
    viteTsconfigPaths() as Plugin,
    topLevelAwait({
      // The export name of top-level await promise for each chunk module
      promiseExportName: '__build_tla',
      // The function to generate import names of top-level await promise in each chunk module
      promiseImportName: i => `__build_tla_${i}`,
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      fileName: () => 'index.mjs',
      formats: ['es'],
    },
    outDir: path.resolve(__dirname, './dist'),
    emptyOutDir: true,
    rollupOptions: {
      external: [
        ...Object.keys(pkg.dependencies),
        ...Object.keys(pkg.devDependencies),
        'http',
        'crypto',
      ],
    },
  },
  server: {
    https: true,
  },
})
