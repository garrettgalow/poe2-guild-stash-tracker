import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8787'
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});