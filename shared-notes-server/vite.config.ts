import * as path from "path";
import { webpackStats } from "rollup-plugin-webpack-stats";
import { defineConfig } from "vite";
import pkg from "./package.json";
// import eslintPlugin from "vite-plugin-eslint";

// https://vitejs.dev/config/
export default defineConfig((conf) => ({
  test: {
    environment: "jsdom",
    setupFiles: ["./vitestSetup.ts"],
  },
  plugins: [webpackStats()],
  // used so that vitest resolves the core package from the sources instead of the built version
  resolve: {
    alias:
      conf.command === "build"
        ? ({} as Record<string, string>)
        : ({
            // load live from sources with live reload working
            // note: didn't get this working due to yjs conflict (multiple versions of yjs)
            // "@blocknote/core": path.resolve(
            //   __dirname,
            //   "../../BlockNote/packages/core/src"
            // ),
            // "y-prosemirror": path.resolve(
            //   __dirname,
            //   "node_modules/y-prosemirror/"
            // ),
            // yjs: path.resolve(__dirname, "./node_modules/yjs/"),
            // "y-prosemirror": path.resolve(
            //   __dirname,
            //   "./node_modules/y-prosemirror/"
            // ),
          } as Record<string, string>),
  },
  build: {
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "hocuspocus-server-demo",
      fileName: "hocuspocus-server-demo",
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: [
        ...Object.keys({
          ...pkg.dependencies,
          // ...pkg.peerDependencies,
          ...pkg.devDependencies,
        }),
        "node:fs",
        "node:http2",
      ],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
        interop: "compat", // https://rollupjs.org/migration/#changed-defaults
      },
    },
  },
}));
