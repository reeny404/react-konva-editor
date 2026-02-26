import prettierConfig from 'eslint-config-prettier';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginReact from 'eslint-plugin-react';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import js from '@eslint/js';
import type { Linter } from 'eslint';
import { globalIgnores } from 'eslint/config';

const config: Linter.Config[] = [
  globalIgnores(['dist/**/*', 'node_modules/**/*']),
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  prettierConfig,
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { js },
  },
  {
    plugins: {
      prettier: pluginPrettier,
    },
    settings: {
      react: {
        version: '19.2.3',
      },
    },
    rules: {
      'prettier/prettier': 'error',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-no-undef': 'error',
      'react/self-closing-comp': 'error',
      'react/jsx-boolean-value': 'error',

      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
        },
      ],
      '@typescript-eslint/no-unused-vars': ['off'],

      curly: ['error', 'all'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-undef': 'error',
      'no-unused-vars': 'off',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-const-assign': 'error',
      'no-console': ['warn', { allow: ['debug', 'warn', 'error'] }],
      'no-debugger': 'warn',
      'no-alert': 'error',
    },
  },
];

export default config;
