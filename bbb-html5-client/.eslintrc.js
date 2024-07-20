module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: [
    'react-refresh',
    'react',
    'jsx-a11y',
    "@typescript-eslint"
  ],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
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
    "react/jsx-uses-react": "off",
    "react/react-in-jsx-scope": "off"
  },
  parserOptions: {
    ecmaVersion: 2020,
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
}
