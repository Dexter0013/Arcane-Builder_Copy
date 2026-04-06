import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // Enable code splitting for better caching and parallel loading
    rollupOptions: {
      output: {
        // Manual chunking strategy: separate vendor code from app code
        manualChunks: (id) => {
          // Three.js and rendering libraries in separate chunk
          if (id.includes('node_modules/three')) {
            return 'three-vendor';
          }
          // Wired Elements UI library
          if (id.includes('node_modules/wired-elements')) {
            return 'wired-vendor';
          }
          // Other node_modules in vendor chunk
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    // Reduce warning threshold
    // Three.js is ~546KB (139KB gzipped) - inherently large but necessary
    // Increase limit to 600KB to avoid warnings for required 3D library
    chunkSizeWarningLimit: 600,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['three', 'wired-elements'],
  },
});
