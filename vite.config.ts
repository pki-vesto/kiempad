import { defineConfig } from 'vite';

// Minimale Vite-config voor het F0-fundament. De PWA-plugin (service worker,
// manifest, offline) wordt in F1 toegevoegd — zie ROADMAP.md / PRODUCT_BACKLOG.md
// (G149/G150). Poort komt uit KIEMPAD_DEV_PORT (.env), met een veilige default.
export default defineConfig({
  server: {
    port: Number(process.env.KIEMPAD_DEV_PORT) || 5173,
  },
  build: {
    outDir: 'dist',
  },
});
