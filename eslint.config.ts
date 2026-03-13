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
  {
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    ignores: ['src/commands/**/*', 'src/stores/**/*', 'src/**/commands/**/*'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/stores/documentStore',
              importNames: ['documentStore'],
              message:
                'documentStore는 Commands 또는 store 정의 파일에서만 사용 가능합니다. 컴포넌트에서는 useDocumentStore 훅을 사용하세요.',
            },
            {
              name: '@/stores/canvasFloorStore',
              importNames: ['canvasFloorStore'],
              message:
                'canvasFloorStore는 Commands 또는 store 정의 파일에서만 사용 가능합니다. 컴포넌트에서는 useCanvasFloorStore 훅을 사용하세요.',
            },
            {
              name: '@/stores/selectionStore',
              importNames: ['selectionStore'],
              message:
                'selectionStore는 Commands 또는 store 정의 파일에서만 사용 가능합니다. 컴포넌트에서는 useSelectionStore 훅을 사용하세요.',
            },
          ],
        },
      ],
    },
  },
];

export default config;
