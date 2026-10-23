import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import autoprefixer from 'autoprefixer';
// eslint-disable-next-line import/no-extraneous-dependencies
import { viteStaticCopy } from 'vite-plugin-static-copy';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isSafariTarget = process.env.TARGET === 'safari';
const detailedLogs = process.env.DETAILED_LOGS || false;
const DEV_ENTRY = '/html5client/client/main.tsx';

process.stdout.write(`Building: ${process.env.TARGET || 'development'}\n`);

function fillEntryUrl(html, entryUrl) {
  return html.replaceAll('__BBB_ENTRY_URL__', entryUrl);
}

/**
 * Classic public/boot.js loads window.__BBB_ENTRY__.
 * Dev: transformIndexHtml fills the Vite ESM path.
 * Prod: JS entry + emit index.html (appType custom) with hashed URL + style.css
 * (cssCodeSplit:false emits style.css but does not inject a link without an HTML entry).
 */
function htmlBootPlugin() {
  const indexPath = path.resolve(__dirname, 'index.html');

  return {
    name: 'bbb-html-boot',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        if (!ctx.server) return html;
        return fillEntryUrl(html, DEV_ENTRY);
      },
    },
    generateBundle(_options, bundle) {
      // Safari build only emits the unminified JS; the default build owns index.html.
      if (isSafariTarget) return;

      const entry = Object.values(bundle).find(
        (chunk) => chunk.type === 'chunk' && chunk.isEntry,
      );
      if (!entry) {
        this.error('bbb-html-boot: no entry chunk found');
      }

      let html = fillEntryUrl(fs.readFileSync(indexPath, 'utf8'), `./${entry.fileName}`);
      if (!html.includes('href="style.css')) {
        html = html.replace(
          '</head>',
          '  <link rel="stylesheet" href="style.css?v=VERSION" crossorigin="anonymous"/>\n</head>',
        );
      }

      this.emitFile({
        type: 'asset',
        fileName: 'index.html',
        source: html,
      });
    },
  };
}

/** Precompress assets for nginx gzip_static (recursive; prior CompressionPlugin). */
function gzipAssetsPlugin() {
  return {
    name: 'bbb-gzip-assets',
    apply: 'build',
    async writeBundle(outputOptions) {
      const outDir = outputOptions.dir || path.resolve(__dirname, 'dist');
      const entries = fs.readdirSync(outDir, { recursive: true });
      await Promise.all(entries.map(async (rel) => {
        if (!/\.(js|css|html|svg)$/i.test(rel)) return;
        if (rel.endsWith('.map') || rel.endsWith('.gz')) return;
        const filePath = path.join(outDir, rel);
        if (!fs.statSync(filePath).isFile()) return;
        const source = fs.readFileSync(filePath);
        if (source.length < 1024) return;
        fs.writeFileSync(`${filePath}.gz`, zlib.gzipSync(source, { level: 9 }));
      }));
    },
  };
}

export default defineConfig(({ command, mode }) => {
  const isBuild = command === 'build';
  const isProd = mode === 'production' || isBuild;

  return {
    // Dev: nginx proxies /html5client/ without stripping. Prod: relative URLs.
    base: isBuild ? './' : '/html5client/',
    publicDir: 'public',
    // Vite 8 / Rolldown "consistent CJS interop": because package.json has
    // "type":"module", default imports from babel-style CJS (__esModule +
    // exports.default) resolve to the whole module.exports object. That breaks
    // react-toggle / react-autosize-textarea (extends / styled(X)). Official
    // escape hatch until those deps ship ESM or we harden call sites:
    // https://vite.dev/guide/migration#consistent-commonjs-interop
    // https://rolldown.rs/in-depth/bundling-cjs#ambiguous-default-import-from-cjs-modules
    legacy: {
      inconsistentCjsInterop: true,
    },
    plugins: [
      react({
        jsxRuntime: 'classic',
        exclude: [/worker\.ts$/],
      }),
      htmlBootPlugin(),
      isBuild && viteStaticCopy({
        targets: [
          { src: 'private', dest: '.' },
        ],
      }),
      isBuild && gzipAssetsPlugin(),
    ].filter(Boolean),
    define: {
      'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
      'process.env.DETAILED_LOGS': JSON.stringify(detailedLogs),
    },
    resolve: {
      extensions: ['.mjs', '.js', '.jsx', '.tsx', '.ts', '.json'],
      alias: [
        { find: '/imports', replacement: path.resolve(__dirname, 'imports') },
        { find: '/client', replacement: path.resolve(__dirname, 'client') },
        {
          find: '@tiptap/core/jsx-runtime',
          replacement: path.resolve(__dirname, 'node_modules/@tiptap/core/dist/jsx-runtime/jsx-runtime.js'),
        },
        { find: 'yjs', replacement: path.resolve(__dirname, 'node_modules/yjs') },
        // Exact match only: the wrapper itself imports mermaid/dist/...
        {
          find: /^mermaid$/,
          replacement: path.resolve(__dirname, 'imports/ui/components/bn-shared-notes/mermaid-on-demand.ts'),
        },
      ],
    },
    oxc: {
      jsx: {
        runtime: 'classic',
      },
    },
    css: {
      postcss: {
        plugins: [
          autoprefixer({
            overrideBrowserslist: ['last 2 versions', '>1%'],
          }),
        ],
      },
    },
    server: {
      port: 3000,
      strictPort: true,
      host: true,
      // Reached through nginx under the server's own domain, as with webpack's 'all'.
      allowedHosts: true,
      // HMR through nginx TLS front door (see bbb-html5.nginx.dev).
      hmr: {
        protocol: 'wss',
        clientPort: Number(process.env.HMR_CLIENT_PORT) || 443,
        path: '/html5client/ws',
      },
      watch: {
        ignored: ['**/node_modules/**', '**/.yalc/**'],
      },
    },
    optimizeDeps: {
      include: ['react-toggle', 'react-autosize-textarea', 'eventemitter2'],
    },
    build: {
      outDir: 'dist',
      // Dual packaging: build-safari then BBB_DUAL_BUILD=1 build. Safari clears
      // dist; the default pass must keep bundle.safari.js. Solo `npm run build`
      // still empties dist as usual.
      emptyOutDir: isSafariTarget || process.env.BBB_DUAL_BUILD !== '1',

      sourcemap: true,
      // Also compiles dependency syntax (e.g. Mermaid's class static blocks) down.
      target: ['chrome87', 'edge88', 'firefox80', 'safari14'],
      cssCodeSplit: false,
      // Safari 14/15 mis-parse some minified JS; ship an unminified twin.
      // Keep CSS minified for both targets (default build overwrites style.css).
      minify: isSafariTarget ? false : 'oxc',
      cssMinify: true,
      assetsInlineLimit: 0,
      rolldownOptions: {
        input: path.resolve(__dirname, 'client/main.tsx'),
        output: {
          format: 'es',
          // Lazy chunks keep Mermaid out of the main bundle; Safari 14/15 stays one file.
          codeSplitting: !isSafariTarget,
          entryFileNames: isSafariTarget ? 'bundle.safari.js' : 'bundle.[hash:20].js',
          chunkFileNames: 'chunk.[name].[hash].js',
          assetFileNames: '[name][extname]',
        },
      },
    },
    // JS entry + custom HTML emit in production; SPA index.html in dev.
    appType: isBuild ? 'custom' : 'spa',
  };
});
