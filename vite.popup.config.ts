import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/popup/index.ts'),
      formats: ['es'],
      fileName: 'popup',
    },
    rollupOptions: {
      external: ['chrome'],
      output: {
        entryFileNames: 'popup.js',
        globals: {
          chrome: 'chrome',
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
}); 
