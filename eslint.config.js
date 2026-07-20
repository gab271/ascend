import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  { ignores: ['dist', 'node_modules', 'supabase'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // Catches the class of bug that cost us a debugging session: an
      // identifier referenced but never imported builds fine and throws at
      // runtime as a blank page.
      'no-undef': 'error',

      // Unused imports are noise and hide real removals. Args prefixed with _
      // are intentional (e.g. the ignored `_type` in setActiveCosmetic).
      'no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrors: 'none',
      }],

      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // Downgraded from error to warn, deliberately.
      //
      // This rule fires on three legitimate cases here: closing the mobile
      // drawer when the route changes, syncing profile state to the auth
      // session, and resetting a loading flag before a fetch. All three are
      // genuinely reacting to something outside React, which is what effects
      // are for. Left as a warning so real cascading-render bugs still surface
      // without blocking the build on correct code.
      'react-hooks/set-state-in-effect': 'warn',

      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    // Node-context config files
    files: ['*.config.js', 'vite.config.js'],
    languageOptions: { globals: globals.node },
  },
];
