module.exports = {
  extends: ['plugin:@typescript-eslint/recommended', 'airbnb'],
  parserOptions: {
    ecmaVersion: 2020,
  },
  plugins: ['react', 'jsx-a11y', 'import'],
  env: {
    es6: true,
    node: true,
    browser: true,
    meteor: true,
    jasmine: true,
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
    rules: {
      'no-underscore-dangle': 0,
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
        },
      ],
      'import/no-absolute-path': 0,
      'import/no-unresolved': 0,
      'import/no-extraneous-dependencies': 1,
      'react/prop-types': 1,
      'jsx-a11y/no-access-key': 0,
      'react/jsx-props-no-spreading': 'off',
      'max-classes-per-file': ['error', 2],
      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': ['error'],
      'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    },
    globals: {
      browser: 'writable',
    },
    overrides: [
      {
        files: ['*.ts', '*.tsx'],
        extends: [
          'eslint:recommended',
          'plugin:@typescript-eslint/recommended',
          'airbnb',
        ],
        parser: '@typescript-eslint/parser',
        plugins: ['@typescript-eslint'],
      },
    ],
  },
};
