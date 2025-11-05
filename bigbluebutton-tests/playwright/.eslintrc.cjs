module.exports = {
  extends: ['airbnb-base', 'prettier'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['import', 'prettier', 'simple-import-sort'],
  env: {
    es6: true,
    node: true,
    browser: true,
  },
  rules: {
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'prettier/prettier': 'error',
    'no-underscore-dangle': 0,
    'import/extensions': [2, 'never'],
    'import/no-absolute-path': 0,
    'import/no-unresolved': 0,
    'import/no-extraneous-dependencies': 1,
    'import/no-named-as-default': 0,
    'import/no-named-as-default-member': 0,
    'max-classes-per-file': ['error', 2],
    'import/prefer-default-export': 'off',
    'import/no-default-export': 1,
    'consistent-return': 'off',
    'no-await-in-loop': 'off',
    'no-plusplus': 'off',
    'no-console': 'off',
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        message:
          'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      },
      {
        selector: 'LabeledStatement',
        message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      },
      {
        selector: 'WithStatement',
        message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      },
    ],
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      extends: ['airbnb-base', 'eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint', 'prettier'],
      rules: {
        'prettier/prettier': 'error',
        '@typescript-eslint/ban-ts-comment': 'off',
        camelcase: 'off',
        'no-use-before-define': 'off',
        'arrow-body-style': 'off',
        'no-shadow': 'off',
        'import/no-absolute-path': 0,
        'import/no-unresolved': 0,
        'no-unused-vars': 0, // https://stackoverflow.com/a/63767419
        'import/extensions': [2, 'never'],
        'import/prefer-default-export': 'off',
        'no-await-in-loop': 'off',
        'no-plusplus': 'off',
        'no-console': 'off',
        'no-restricted-syntax': [
          'error',
          {
            selector: 'ForInStatement',
            message:
              'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
          },
          {
            selector: 'LabeledStatement',
            message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
          },
          {
            selector: 'WithStatement',
            message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
          },
        ],
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
  settings: {
    'import/ignore': ['node_modules', '.(json|css)$'],
  },
};
