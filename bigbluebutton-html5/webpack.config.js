const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

const env = process.env.NODE_ENV || 'development';
const detailedLogs = process.env.DETAILED_LOGS || false;
const hotReload = String(process.env.HOT_RELOAD).toLowerCase() === 'true';
const prodEnv = 'production';
const devEnv = 'development';
const isDev = env === devEnv;
const isSafariTarget = process.env.TARGET === 'safari';

process.stdout.write(`Building: ${process.env.TARGET}\n`);

// With source maps on, webpack's filesystem cache stores each bundle and its
// map under the bundle's file name. A new name per rebuild would keep every
// old bundle and map (~100 MB each) in the cache until maxAge.
const bundleFilename = env === prodEnv ? 'bundle.[fullhash].js' : 'bundle.js';

// Dev builds: the hash of each script the page loads, by file name. main.html
// puts it in the script's URL, and the dev server lets the browser keep a URL
// whose hash is the current one (see devScripts and devServer.headers).
const devScriptHashes = new Map();

const config = {
  entry: './client/main.tsx',
  output: {
    filename: isSafariTarget
      ? 'bundle.safari.js'
      : bundleFilename,
    path: path.resolve(__dirname, 'dist'),
    publicPath: '',
  },
  cache: {
    type: 'filesystem',
    allowCollectingMemory: true,
    // Only active during local yalc-based tldraw development. When the file exists,
    // webpack discards its cache on each rebuild so stale ENOENT errors can't persist.
    // Absent in production / CI (package comes from npm), so no effect there.
    ...(fs.existsSync(path.join(__dirname, '.tldraw-build-id')) && {
      buildDependencies: {
        tldraw: [path.join(__dirname, '.tldraw-build-id')],
      },
    }),
  },
  snapshot: {
    // Exclude tldraw from version-based managed-path caching so webpack uses
    // content hashing instead. Without this, webpack treats the package as
    // unchanged because yalc never bumps the version (2.0.0-alpha.33 forever).
    managedPaths: [/^(.+?[\\/]node_modules[\\/])(?!@bigbluebutton[\\/]tldraw[\\/])/],
  },
  watchOptions: {
    // Ignore .yalc/ so that yalc remove+add operations don't trigger webpack
    // rebuilds mid-flight (which would ENOENT on partially-deleted files and
    // cache that failure). Only our explicit triggerWebpackRebuild touch
    // (component.jsx) should start a tldraw rebuild.
    ignored: /node_modules|\.yalc/,
  },
  devtool: 'source-map',
  plugins: [
    // Safari 14-15 build: one file, build.sh renames it (#22817)
    isSafariTarget && new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
    new HtmlWebpackPlugin({
      template: './client/main.html',
      filename: 'index.html',
      inject: false,
      // Render the page on every rebuild. With the fixed dev bundle name, the
      // plugin would keep its last page and an old build hash.
      cache: false,
      templateParameters: (compilation, assets, assetTags, options) => {
        const fullhash = compilation.hash;
        return {
          compilation,
          webpackConfig: compilation.options,
          htmlWebpackPlugin: {
            tags: assetTags,
            files: assets,
            options,
          },
          bundleHash: fullhash,
          isProduction: env === prodEnv,
          // Dev builds split the page's code into several files (see
          // splitChunks below); main.html loads each one of them, with a hash
          // of its bytes in the URL
          devScripts: env === prodEnv ? [] : assets.js.map((file) => {
            const content = compilation.getAsset(file).source.buffer();
            devScriptHashes.set(file, crypto.createHash('sha1').update(content).digest('hex'));
            return `${file}?contenthash=${devScriptHashes.get(file)}`;
          }),
        };
      },
    }),
    new MiniCssExtractPlugin({
      filename: 'styles.css',
    }),
    new CopyPlugin({
      patterns: [
        { from: 'public', to: '.' },
        { from: 'private', to: 'private' },
      ],
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env),
      'process.env.DETAILED_LOGS': detailedLogs,
    }),
    (isDev && hotReload) && new ReactRefreshWebpackPlugin({
      overlay: false,
      exclude: /worker\.ts$/,
    }),
  ],
  resolve: {
    modules: ['node_modules', 'src'],
    enforceExtension: false,
    fullySpecified: false,
    extensions: ['.mjs', '.js', '.jsx', '.tsx', '.ts', '...'],
    alias: {
      '/client': path.resolve(__dirname, 'client/'),
      '/imports': path.resolve(__dirname, '/imports/'),
      '@tiptap/core/jsx-runtime': path.resolve(__dirname, 'node_modules/@tiptap/core/dist/jsx-runtime/jsx-runtime.js'),
      yjs: path.resolve(__dirname, 'node_modules/yjs'),
      mermaid$: path.resolve(__dirname, 'imports/ui/components/bn-shared-notes/mermaid-on-demand.ts'),
    },
  },
  module: {
    // Dynamic imports stay in the bundle (#22817), except Mermaid's (lazy)
    parser: {
      javascript: {
        dynamicImportMode: 'eager',
      },
    },
    rules: [
      {
        test: /[\\/]node_modules[\\/](mermaid|@mermaid-js[\\/][^\\/]+)[\\/]/,
        parser: {
          dynamicImportMode: 'lazy',
        },
        // Mermaid ships class static blocks, which Safari parses only from 16.4:
        // compile its syntax down to the oldest Safari the client supports.
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            configFile: false,
            sourceType: 'unambiguous',
            presets: [['@babel/preset-env', { targets: { safari: '14' }, modules: false }]],
          },
        },
      },
      {
        test: /\.(js|jsx|ts|tsx)$/,
        resolve: {
          fullySpecified: false,
          enforceExtension: false,
        },
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [(isDev && hotReload) && require.resolve('react-refresh/babel')].filter(Boolean),
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  [
                    'autoprefixer',
                    {
                      overrideBrowserslist: ['last 2 versions', '>1%'],
                    },
                  ],
                ],
              },
            },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        exclude: /node_modules/,
        use: ['file-loader'],
      },
    ],
  },
};

if (env === prodEnv) {
  config.plugins.push(new CompressionPlugin());
  config.mode = prodEnv;
  config.optimization = {
    minimize: true,
    minimizer: isSafariTarget ? [] : [new TerserPlugin({
      // Preserve the `startScreensharing` function name in the minified
      // bundle. The tablet app (imports/ui/services/mobile-app/index.js)
      // inspects the JS stack trace for this name to route screen sharing
      // to the native broadcast upload extension; if the minifier strips
      // it, the call is misclassified and screen sharing silently fails on
      // the tablet app. Scoped via regex so the global bundle-size cost of
      // a blanket keep_fnames is avoided.
      terserOptions: {
        keep_fnames: /startScreensharing/,
      },
    })],
  };
  config.performance = {
    hints: 'warning',
    maxAssetSize: isSafariTarget ? 16000000 : 8000000,
    maxEntrypointSize: isSafariTarget ? 16000000 : 8000000,
  };
} else {
  config.mode = devEnv;
  const mainEntryOnly = (chunk) => chunk.name === 'main';
  // Split the code the page loads at startup into several files, so that the
  // browser downloads again only the ones an edit changed: node_modules in
  // vendors-*.js, imports/ in app-*.js, and the rest (webpack's runtime and
  // client/) in bundle.js. maxSize makes webpack cut each group into parts
  // along folder boundaries. The parts stay few: each file is a request on
  // the first load, and one more for its source map when DevTools is open.
  // Only the main entry: the connection-status worker keeps loading alone,
  // and Mermaid stays lazy.
  config.optimization = {
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          chunks: mainEntryOnly,
          name: 'vendors',
          filename: '[name].js',
          minSize: 1000000,
          maxSize: 8000000,
          enforce: true,
        },
        app: {
          test: path.join(__dirname, 'imports') + path.sep,
          chunks: mainEntryOnly,
          name: 'app',
          filename: '[name].js',
          minSize: 300000,
          // It defaults to minSize, and bundle.js is left with less than that
          minRemainingSize: 0,
          maxSize: 1500000,
          enforce: true,
        },
      },
    },
  };
  config.devServer = {
    port: 3000,
    hot: true,
    allowedHosts: 'all',
    // Make the browser revalidate every file, and answer unchanged ones with a
    // 304 instead of sending them again. Strong ETags hash the content, so they
    // still match after a restart or when webpack rewrites the same bytes.
    devMiddleware: {
      etag: 'strong',
      cacheControl: 'no-cache',
    },
    // A script URL with the hash of the file's current bytes never serves
    // anything else, so the browser can keep it and not ask again: a page
    // load then makes no request for a script that did not change. A URL
    // with any other hash is left to revalidate, like every other file.
    headers: (req) => {
      const { pathname, searchParams } = new URL(req.url, 'http://localhost');
      const current = devScriptHashes.get(pathname.slice(1)) === searchParams.get('contenthash');
      return current ? { 'Cache-Control': 'public, max-age=31536000, immutable' } : {};
    },
    client: {
      overlay: false,
      webSocketURL: 'auto://0.0.0.0:0/html5client/ws',
    },
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      devServer.app.use((req, res, next) => {
        // the server crashes when it receives HEAD requests, so we need to prevent it
        if (req.method === 'HEAD') {
          // console.log(`Request received: ${req.method} ${req.url}`);
          res.setHeader('Content-Type', 'text/html');
          res.setHeader('Content-Length', '0');
          res.end();
        } else {
          next();
        }
      });

      return middlewares;
    },
  };
}

module.exports = config;
