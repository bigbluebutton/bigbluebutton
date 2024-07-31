module.exports = {
  presets: [
    '@babel/env',
    '@babel/typescript',
    '@babel/react',
  ],
  plugins: [
    [
      '@babel/plugin-transform-runtime',
      {
        // helpers: true,
        // useESModules: true,

      },
    ],
    [
      require.resolve('babel-plugin-module-resolver'),
      {
        cwd: 'babelrc',
        extensions: ['.mjs', '.ts', '.tsx', '.js', '.jsx'],
        alias: {
          '/imports': './imports',
          '/client': './client',
        },
      },
    ],
    // [require.resolve('transform-decorators-legacy')],
    // [require.resolve('add-module-exports')],
    // [require.resolve('react-hot-loader/babel')],
    // [require.resolve('@babel/runtime-corejs3')],
  ],
};
