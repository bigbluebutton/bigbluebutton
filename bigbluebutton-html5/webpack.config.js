const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const env = process.env.NODE_ENV || 'development';

const prodEnv = 'production';
const devEnv = 'development';

const config = {
  entry: './client/main.tsx',
  output: {
    filename: 'bundle.[fullhash].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '',
  },
  cache: {
    type: 'filesystem',
    allowCollectingMemory: true,
  },
  devtool: 'source-map',
  plugins: [
    new HtmlWebpackPlugin({
      template: './client/main.html',
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
        use: ['babel-loader'],
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
    minimizer: [new TerserPlugin()],
  };
  config.performance = {
    hints: 'warning',
    maxAssetSize: 6000000,
    maxEntrypointSize: 6000000,
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
  };
}

module.exports = config;
