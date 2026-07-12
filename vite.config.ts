import { defineConfig, loadEnv, type Plugin } from 'vite';

const DEV_CONNECT_SOURCES = [
  'http://localhost:*',
  'http://127.0.0.1:*',
  'ws://localhost:*',
  'ws://127.0.0.1:*',
] as const;

export function transformCspConnectSrc(html: string, sources: readonly string[]): string {
  if (sources.length === 0) return html;
  const uniqueSources = [...new Set(sources)];
  return html.replace("connect-src 'self'", `connect-src 'self' ${uniqueSources.join(' ')}`);
}

export function centralApiOrigin(value: string | undefined): string | undefined {
  if (!value?.trim()) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.origin : undefined;
  } catch {
    return undefined;
  }
}

function cspConnectSrcPlugin(sources: readonly string[]): Plugin {
  return {
    name: 'kiempad-csp-connect-src',
    enforce: 'pre',
    transformIndexHtml(html) {
      return transformCspConnectSrc(html, sources);
    },
  };
}

// Minimale Vite-config voor het F0-fundament. De PWA-plugin (service worker,
// manifest, offline) wordt in F1 toegevoegd — zie ROADMAP.md / PRODUCT_BACKLOG.md
// (G149/G150). Poort komt uit KIEMPAD_DEV_PORT (.env), met een veilige default.
export default defineConfig(({ command, mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  const centralOrigin = centralApiOrigin(env.VITE_KIEMPAD_CENTRAL_API_URL);
  const connectSources = command === 'serve' ? DEV_CONNECT_SOURCES : centralOrigin ? [centralOrigin] : [];

  return {
    plugins: [cspConnectSrcPlugin(connectSources)],
    server: {
      port: Number(env.KIEMPAD_DEV_PORT) || 5173,
    },
    build: {
      outDir: 'dist',
    },
  };
});
