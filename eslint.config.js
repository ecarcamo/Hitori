import { existsSync, readdirSync } from 'node:fs'
import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import importX from 'eslint-plugin-import-x'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const FEATURES_DIR = './src/features'

const featureNames = existsSync(FEATURES_DIR)
  ? readdirSync(FEATURES_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
  : []

const featureInternals = (feature) => ({
  from: `${FEATURES_DIR}/${feature}`,
  except: ['./index.ts', './index.tsx'],
  message: 'Importa otra feature solo desde su index (@/features/<feature>).',
})

const boundaryZones = [
  {
    target: './src/shared',
    from: ['./src/features', './src/app'],
    message: 'shared no depende de features ni de app.',
  },
  {
    target: FEATURES_DIR,
    from: './src/app',
    message: 'Una feature no depende de app.',
  },
  ...featureNames.map((feature) => ({ target: './src/app', ...featureInternals(feature) })),
  ...featureNames.flatMap((target) =>
    featureNames
      .filter((source) => source !== target)
      .map((source) => ({ target: `${FEATURES_DIR}/${target}`, ...featureInternals(source) })),
  ),
]

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules', 'supabase/functions'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: { 'import-x': importX },
    settings: {
      'import-x/resolver-next': [createTypeScriptImportResolver()],
    },
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'import-x/no-restricted-paths': ['error', { zones: boundaryZones }],
      'import-x/no-cycle': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always'],
      '@typescript-eslint/only-throw-error': [
        'error',
        { allow: [{ from: 'package', package: '@tanstack/router-core', name: 'Redirect' }] },
      ],
      'max-lines-per-function': ['warn', { max: 150, skipBlankLines: true }],
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', 'src/test/**'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  {
    files: ['*.config.{js,ts}'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  prettier,
)
