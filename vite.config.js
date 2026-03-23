import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/phaser')) {
            return 'phaser-vendor';
          }
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});