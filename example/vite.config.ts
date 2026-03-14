import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: resolve(rootDir),
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: 'agent-approval-card/styles.css',
        replacement: resolve(rootDir, '../src/styles.css')
      },
      {
        find: 'agent-approval-card',
        replacement: resolve(rootDir, '../src/index.ts')
      }
    ]
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
