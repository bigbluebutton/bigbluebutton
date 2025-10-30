module.exports = {
  extends: 'airbnb',
  parserOptions: {
    ecmaVersion: 2020,
  },
  plugins: ['react', 'react-hooks', 'jsx-a11y', 'import'],
  env: {
    es6: true,
    node: true,
    browser: true,
    meteor: true,
    jasmine: true,
  },
  ignorePatterns: ['public/compatibility/*', 'Gruntfile.js', '**/sdpUtils.js', '**/utils/*.js'],
  rules: {

    'object-shorthand': 0,
    'prefer-rest-params': 0,
    'implicit-arrow-linebreak': 0,
    'nonblock-statement-body-position': 0,
    'curly': 0,
    'func-call-spacing': 0,
    'padded-blocks': 0,
    'quote-props': 0,
    'no-underscore-dangle': 0,
    'indent': 0,
    'space-before-function-paren': 0,
    'operator-linebreak': 0,
    'no-multiple-empty-lines': 0,
    'func-names': 0,
    'camelcase': 0,
    'linebreak-style': 0,
    'quotes': 0,
    'semi': 0,
    'comma-dangle': 0,
    'keyword-spacing': 0,
    'space-in-parens': 0,
    'no-mixed-operators': 0,
    'object-curly-spacing': 0,
    'array-bracket-spacing': 0,
    'object-curly-newline': 0,
    'template-curly-spacing': 0,
    'arrow-parens': 0,
    'max-len': 0,
    'arrow-spacing': 0,
    'no-spaced-func': 0,
    'no-multi-spaces': 0,
    'arrow-body-style': 0,
    'prefer-arrow-callback': 0,
    'space-before-blocks': 0,
    'block-spacing': 0,
    'comma-spacing': 0,

    'import/extensions': [2, 'never'],
    'import/no-absolute-path': 0,
    'import/no-unresolved': 0,
    'import/no-extraneous-dependencies': 1,

    'react/prop-types': 1,

    'jsx-a11y/no-access-key': 0,
    'react/jsx-props-no-spreading': 'off',

    'max-classes-per-file': ['error', 2],
    'react/require-default-props': 0,

    // Core hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
  globals: {
    browser: 'writable',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      extends: ['airbnb', 'eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:security/recommended-legacy'],
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
