import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Build-time settings come from .env (same file deploy.sh / run-dev.sh create from
// .env.example). Only REACT_APP_* keys reach the bundle — the contract the source
// already relies on.
//
// process.env is replaced as a whole object, not key by key: the source reads
// REACT_APP_* names that are frequently unset (STANDALONE_MODE is only set for
// standalone builds), and a per-key define would leave those reads as a literal
// `process.env.X` in the bundle. Substituting the whole object makes an unset
// variable read as undefined.
export default defineConfig(({ mode }) => {
  const isDev = mode !== 'production';
  const fileEnv = loadEnv(mode, __dirname, '');
  const mergedEnv = { ...process.env, ...fileEnv };

  const appEnv = Object.keys(mergedEnv)
    .filter((key) => key.startsWith('REACT_APP_'))
    .reduce((acc, key) => ({ ...acc, [key]: mergedEnv[key] }), {});

  // Dev: nginx proxies /learning-analytics-dashboard/ to this server, so base
  // must be spelled out. Prod: relative assets so the same build works under
  // that path and as exported static files.
  const base = isDev ? '/learning-analytics-dashboard/' : './';

  return {
    base,
    plugins: [
      react({
        // Keep classic JSX to match React 17 + existing source (no automatic runtime).
        jsxRuntime: 'classic',
      }),
    ],
    define: {
      'process.env': JSON.stringify({
        NODE_ENV: mode,
        ...appEnv,
      }),
    },
    oxc: {
      jsx: {
        runtime: 'classic',
      },
    },
    build: {
      outDir: 'build',
      sourcemap: true,
      // Same floor as the HTML5 client; also keeps media queries readable by Safari < 16.4.
      target: ['chrome87', 'edge88', 'firefox80', 'safari14'],
      emptyOutDir: true,
      assetsDir: 'static',
    },
    server: {
      port: 3100,
      strictPort: true,
      host: true,
      // public/ is served as-is (mock learning_dashboard_data.json for run-dev.sh).
      // HMR connects through the nginx TLS proxy (see learning-dashboard-dev.nginx).
      hmr: {
        protocol: 'wss',
        clientPort: Number(process.env.HMR_CLIENT_PORT) || 443,
        path: '/learning-analytics-dashboard/ws',
      },
    },
  };
});
