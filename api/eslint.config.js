// eslint.config.js
export default [
  {
    files: ['**/*.js'],
    ignores: ['node_modules/', 'config/', 'logs/', '.env', '*.config.js'], // replace with your ignored paths
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      'no-console': 'warn',
      'no-unused-vars': 'error',
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      'comma-dangle': ['error', 'always-multiline'],
    },
  },
];
