const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

// Build-time settings come from .env, the same file deploy.sh and run-dev.sh create
// from .env.example. Only REACT_APP_* keys reach the bundle, which is the contract
// the source already relies on.
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// process.env is replaced as a whole object, not key by key: the source reads
// REACT_APP_* names that are frequently unset (STANDALONE_MODE is only set for
// standalone builds), and a per-key define would leave those reads as a literal
// `process.env.X` in the bundle, which throws ReferenceError in the browser.
// Substituting the whole object makes an unset variable read as undefined, which
// is the behaviour every one of those call sites already expects.
const appEnv = Object.keys(process.env)
  .filter((key) => key.startsWith('REACT_APP_'))
  .reduce((acc, key) => ({ ...acc, [key]: process.env[key] }), {});

// Mode comes from webpack's own --mode flag, so there is a single source of truth
// for it; NODE_ENV is carried into the process.env replacement below from the same
// value rather than from the ambient environment.
module.exports = (_env, argv) => {
  const isDev = (argv.mode || 'development') !== 'production';

  // The dashboard is served from /learning-analytics-dashboard/. In production the
  // assets are referenced relatively, so the same build works under that path and as
  // exported static files; in development nginx proxies the whole prefix through to
  // this dev server (see learning-dashboard-dev.nginx), so it has to be spelled out.
  const publicPath = isDev ? '/learning-analytics-dashboard/' : '';

  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: 'static/js/[name].[contenthash:8].js',
      chunkFilename: 'static/js/[name].[contenthash:8].chunk.js',
      assetModuleFilename: 'static/media/[name].[hash][ext]',
      publicPath,
      clean: true,
    },
    // Source maps ship in production on purpose: the deb packages whatever lands in
    // build/, and the deployed dashboard has always carried them.
    devtool: 'source-map',
    resolve: {
      extensions: ['.js', '.jsx'],
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              // No explicit targets: @babel/preset-env reads the browserslist field
              // from package.json and honours its production/development split.
              presets: ['@babel/preset-env', '@babel/preset-react'],
              plugins: [isDev && require.resolve('react-refresh/babel')].filter(Boolean),
              cacheDirectory: true,
            },
          },
        },
        {
          test: /\.css$/,
          use: [
            isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
            { loader: 'css-loader', options: { importLoaders: 1, sourceMap: true } },
            // postcss.config.js is picked up as-is, which is what keeps Tailwind and
            // autoprefixer working exactly as they did under react-scripts.
            { loader: 'postcss-loader', options: { sourceMap: true } },
          ],
        },
        {
          test: /\.(png|jpe?g|gif|svg|woff2?|eot|ttf)$/,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        // The template's <base href> follows the same rule as publicPath above.
        templateParameters: { PUBLIC_URL: isDev ? '/learning-analytics-dashboard' : '.' },
      }),
      // Keeps every process.env.REACT_APP_* read-site in src/ working unchanged.
      new webpack.DefinePlugin({
        'process.env': JSON.stringify({ NODE_ENV: argv.mode || 'development', ...appEnv }),
      }),
      // Everything else in public/ (favicon.ico, and the optional mock-data folder
      // run-dev.sh points at) ships alongside the bundle, as it did under CRA.
      !isDev && new CopyPlugin({
        patterns: [{ from: 'public', globOptions: { ignore: ['**/index.html'] } }],
      }),
      !isDev && new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash:8].css',
      }),
      isDev && new ReactRefreshWebpackPlugin({ overlay: false }),
    ].filter(Boolean),
    devServer: {
      port: 3100,
      hot: true,
      historyApiFallback: true,
      allowedHosts: 'all',
      // public/ is served as-is, which is what makes the mock-data hint in
      // run-dev.sh (public/test/test/learning_dashboard_data.json) work.
      static: { directory: path.resolve(__dirname, 'public'), publicPath },
      client: {
        overlay: false,
        // HMR connects back through the nginx TLS proxy on 443 rather than to the
        // dev-server port directly, replacing CRA's WDS_SOCKET_PORT/WDS_SOCKET_PATH.
        webSocketURL: {
          protocol: 'wss',
          port: Number(process.env.HMR_CLIENT_PORT) || 443,
          pathname: '/learning-analytics-dashboard/ws',
        },
      },
    },
    optimization: {
      // '...' keeps webpack's default JS minifier (Terser); the CSS one has to be
      // named explicitly, and without it the extracted stylesheet ships unminified,
      // which measured ~35% larger gzipped than the react-scripts output.
      minimizer: ['...', new CssMinimizerPlugin()],
    },
    performance: { hints: false },
    stats: 'errors-warnings',
  };
};
