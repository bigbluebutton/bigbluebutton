const { fallbackHttpConfig } = require("@apollo/client");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { override } = require("mobx");
const path = require("path");
const webpack = require('webpack');

module.exports = {
  entry: "./src/index.tsx",
  mode: "development",
  output: {
    filename: "bundle.[fullhash].js",
    path: path.resolve(__dirname, "dist"),
    publicPath: '/'
  },
  devServer: {
    port: 3000,
    historyApiFallback: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
    new MiniCssExtractPlugin({
      filename: 'styles.css'
    }),
  ],
  resolve: {
    modules: ["node_modules", "src",],
    enforceExtension: false,
    fullySpecified: false,
    extensions: [".mjs",".js",".jsx",".tsx",".ts", "..."],
    alias: {
      '/src': path.resolve(__dirname, 'src/'),
      '/imports': path.resolve(__dirname, 'src/imports/'),   
    }
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
          "style-loader",
          {
            loader: "css-loader",
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [
                  [
                   "autoprefixer",
                   {
                    overrideBrowserslist: ["last 2 versions", ">1%"]
                   }
                  ],
                ],
              },
            },
          },
        ]
        
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        exclude: /node_modules/,
        use: ["file-loader"]
      }, 
    ],
  },
};