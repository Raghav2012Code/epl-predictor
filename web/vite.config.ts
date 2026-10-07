import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const rootDir = import.meta.dirname;

export default defineConfig({
  root: rootDir,
  // Absolute base: the app is served from the domain root and supports
  // trailing-slash routes (/fixtures/), which the router resolves via
  // pathname.replace(/\/$/, ""). A relative base emits document-relative
  // asset URLs, so on /fixtures/ the browser requests
  // /fixtures/assets/index-*.js, which matches the SPA rewrite in
  // vercel.json, is served back as index.html with Content-Type text/html,
  // and the module script is rejected, leaving a blank page.
  base: '/',
  resolve: {
    alias: { '@': `${rootDir}/src` },
  },
  plugins: [react()],
  build: {
    outDir: `${rootDir}/dist`,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Rolldown (Vite 8) only accepts function-form manualChunks.
        manualChunks: (id: string) => {
          if (!id.includes('node_modules')) return undefined;
          const normalized = id.replace(/\\/g, '/');
          if (/node_modules\/lucide-react\//.test(normalized)) return 'vendor-icons';
          if (/node_modules\/(react|react-dom|scheduler)(\/|$)/.test(normalized)) return 'vendor-react';
          return undefined;
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
