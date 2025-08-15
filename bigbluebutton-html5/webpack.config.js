const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const env = process.env.NODE_ENV || 'development';
const detailedLogs = process.env.DETAILED_LOGS || false;
const hotReload = String(process.env.HOT_RELOAD).toLowerCase() === 'true';
const prodEnv = 'production';
const devEnv = 'development';
const isDev = env === devEnv;
const isSafariTarget = process.env.TARGET === 'safari';

console.log(`Building: ${process.env.TARGET}`);

const config = {
  entry: './client/main.tsx',
  output: {
    filename: isSafariTarget
      ? 'bundle.safari.js'
      : 'bundle.[fullhash].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '',
  },
  cache: {
    type: 'filesystem',
    allowCollectingMemory: true,
    maxAge: 86400000,
  },
  devtool: 'source-map',
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
    new HtmlWebpackPlugin({
      template: './client/main.html',
      filename: 'index.html',
      inject: false,
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
    },
  },
  module: {
    rules: [
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
  config.mode = prodEnv;
  config.optimization = {
    minimize: true,
    minimizer: isSafariTarget ? [] : [new TerserPlugin()],
  };
  config.performance = {
    hints: 'warning',
    maxAssetSize: isSafariTarget ? 16000000 : 8000000,
    maxEntrypointSize: isSafariTarget ? 16000000 : 8000000,
  };
} else {
  config.mode = devEnv;
  config.devServer = {
    port: 3000,
    hot: true,
    allowedHosts: 'all',
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
