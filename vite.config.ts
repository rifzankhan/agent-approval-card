import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/test/**'],
      insertTypesEntry: true
    })
  ],
  build: {
    lib: {
      entry: resolve(rootDir, 'src/index.ts'),
      name: 'AgentApprovalCard',
      formats: ['es'],
      fileName: () => 'index.js',
      cssFileName: 'styles'
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime']
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true
  }
});
