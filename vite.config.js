import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Specify files to be copied to the dist directory
    assetsInlineLimit: 0,
    rollupOptions: {
      // Preserve the original output and add a custom copy command
      preserveEntrySignatures: 'strict',
      output: {
        manualChunks: {
          // Exclude _headers from the chunk
          '_headers': [],
        },
        entryFileNames: 'assets/index.js',
        chunkFileNames: 'assets/index.js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
  // Add a custom command to copy _headers to the dist directory
  // This will copy _headers to the root of the dist directory
  // and it won't be processed by Rollup
  optimizeDeps: {
    include: ['_headers'],
  },
});