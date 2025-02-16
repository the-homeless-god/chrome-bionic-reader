import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      formats: ['es'],
      entry: {
        background: resolve(__dirname, 'src/background/index.ts'),
        content: resolve(__dirname, 'src/content/init.ts'),
        popup: resolve(__dirname, 'src/popup/index.ts'),
      },
    },
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
        format: 'es',
        preserveModules: false,
        globals: {
          chrome: 'chrome',
        },
      },
      external: ['chrome'],
    },
    target: 'esnext',
    minify: false,
    sourcemap: true,
    modulePreload: {
      polyfill: false,
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
}); 
