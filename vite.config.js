import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Specify files to be copied to the dist directory
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: {
          // Include _headers in the build
          '_headers': ['_headers'],
        },
      },
    },
  },
});