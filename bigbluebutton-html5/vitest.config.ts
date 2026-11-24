import path from 'path';
import { transformWithEsbuild } from 'vite';
import { defineConfig } from 'vitest/config';

const projectJs = /\/bigbluebutton-html5\/(imports|client)\/.*\.js$/;

// Unit tests for the html5 client. The client resolves `/imports/...` and `/client/...` from the
// project root (webpack resolve.roots), so the same absolute paths are mapped here.
export default defineConfig({
  plugins: [
    {
      // Some .js files contain JSX, which webpack's babel-loader accepts. Vite only parses JSX in
      // .jsx/.tsx, so the project's .js files go through esbuild's JSX loader first.
      name: 'bbb-js-with-jsx',
      enforce: 'pre',
      async transform(code, id) {
        if (!projectJs.test(id)) return null;
        return transformWithEsbuild(code, id, { loader: 'jsx', jsx: 'automatic' });
      },
    },
  ],
  resolve: {
    alias: [
      { find: /^\/imports\//, replacement: `${path.resolve(__dirname, 'imports')}/` },
      { find: /^\/client\//, replacement: `${path.resolve(__dirname, 'client')}/` },
    ],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['imports/**/*.test.{ts,tsx,js,jsx}', 'client/**/*.test.{ts,tsx,js,jsx}'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'json-summary', 'html'],
      include: [
        'imports/ui/components/layout/**',
        'imports/ui/components/webcam/component.tsx',
        'imports/ui/components/sidebar-content/useSidebarResize.ts',
        'imports/ui/components/plugins-engine/ui-commands/{nav-bar,actions-bar,sidekick-area}/**',
        'imports/ui/components/plugins-engine/ui-data-hooks/layout/**',
        'imports/ui/core/hooks/useElementSize.ts',
        'imports/ui/components/user-list/crowd-action-buttons/isAtMinWidth.ts',
      ],
      reportsDirectory: './coverage',
    },
  },
});
