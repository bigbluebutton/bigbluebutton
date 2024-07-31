const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const BomPlugin = require('webpack-utf8-bom');

module.exports = {
  entry: './client/main.tsx',
  mode: 'development',
  output: {
    filename: 'bundle.[fullhash].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '',
  },
  devtool: 'source-map',
  devServer: {
    port: 3000,
    hot: true,
    client: {
      overlay: false,
      webSocketURL: 'html5client/ws',
    },
  },
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
      ],
    }),
    new BomPlugin(true),
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
