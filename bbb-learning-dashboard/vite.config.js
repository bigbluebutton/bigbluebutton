import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  // The built assets are referenced relatively (equivalent to CRA's
  // homepage: ".") so the same build works when served under
  // /learning-analytics-dashboard/ and when exported as standalone
  // static files. The dev server, however, is reached through the nginx
  // proxy under this fixed path (see learning-dashboard-dev.nginx).
  base: command === 'serve' ? '/learning-analytics-dashboard/' : './',
  plugins: [react()],
  build: {
    outDir: 'build',
  },
  // Keep run-dev.sh's own output (dashboard address, mock-data hint) visible.
  clearScreen: false,
  server: {
    port: Number(process.env.PORT) || 3100,
    strictPort: true,
    // Bind all interfaces (CRA behavior). No allowedHosts needed: the nginx
    // dev proxy targets 127.0.0.1:3100 without overriding the Host header,
    // and Vite's default host check accepts localhost and IP-literal Hosts.
    host: true,
    // HMR_CLIENT_PORT makes the HMR websocket connect through the nginx
    // TLS proxy (443) instead of directly to the dev-server port; set by
    // run-dev.sh (replaces CRA's WDS_SOCKET_PORT).
    hmr: process.env.HMR_CLIENT_PORT
      ? { clientPort: Number(process.env.HMR_CLIENT_PORT) }
      : true,
  },
}));
