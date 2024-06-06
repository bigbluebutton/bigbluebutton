module.exports = {
  extends: 'airbnb',
  parserOptions: {
    ecmaVersion: 2020,
  },
  plugins: [
    'react',
    'jsx-a11y',
    'import',
  ],
  env: {
    es6: true,
    node: true,
    browser: true,
    meteor: true,
    jasmine: true,
  },
  rules: {
    'no-underscore-dangle': 0,
    'import/extensions': [2, 'never'],
    'import/no-absolute-path': 0,
    'import/no-unresolved': 0,
    'import/no-extraneous-dependencies': 1,
    'react/prop-types': 'off',
    'jsx-a11y/no-access-key': 0,
    'react/jsx-props-no-spreading': 'off',
    'max-classes-per-file': ['error', 2],
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
  },
  globals: {
    browser: 'writable',
  },
  settings: {
    'import/ignore': [
      'node_modules',
      '.(json|css)$',
    ],
  },
};
