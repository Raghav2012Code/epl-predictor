import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const rootDir = import.meta.dirname;

export default defineConfig({
  root: rootDir,
  base: './',
  resolve: {
    alias: { '@': `${rootDir}/src` },
  },
  plugins: [react(), tailwindcss()],
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
