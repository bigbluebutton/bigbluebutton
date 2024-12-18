module.exports = {
  extends: 'airbnb',
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
  rules: {
    'no-underscore-dangle': 0,
    'import/extensions': [2, 'never'],
    'import/no-absolute-path': 0,
    'import/no-unresolved': 0,
    'import/no-extraneous-dependencies': 1,
    'react/prop-types': 1,
    'jsx-a11y/no-access-key': 0,
    'react/jsx-props-no-spreading': 'off',
    'max-classes-per-file': ['error', 2],
    'react/require-default-props': 0,
  },
  globals: {
    browser: 'writable',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      extends: ['airbnb', 'eslint:recommended', 'plugin:@typescript-eslint/recommended'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      rules: {
        '@typescript-eslint/ban-ts-comment': 'off',
        camelcase: 'off',
        'no-use-before-define': 'off',
        'arrow-body-style': 'off',
        'no-shadow': 'off',
        'import/no-absolute-path': 0,
        'import/no-unresolved': 0,
        'no-unused-vars': 0, // https://stackoverflow.com/a/63767419
        'import/extensions': [2, 'never'],
        'react/sort-comp': [0],
        'react/jsx-filename-extension': ['error', { extensions: ['.tsx', '.jsx'] }],
        'react/require-default-props': 0,
        'max-len': [
          'error',
          {
            code: 120, // Maximum line length (characters)
            tabWidth: 2, // Number of spaces per tab
            ignoreUrls: true, // Ignore long URLs
            ignoreStrings: true, // Ignore long strings
          },
        ],
      },
    },
  ],
};
