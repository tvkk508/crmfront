import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

/** Legacy re-export bridges under `src/ui/*.tsx` — they may import `./kit/*`; must not trip the guardrail. */
const LEGACY_UI_BRIDGE_FILES = [
  'src/ui/Button.tsx',
  'src/ui/Badge.tsx',
  'src/ui/Input.tsx',
  'src/ui/Dialog.tsx',
  'src/ui/Tabs.tsx',
  'src/ui/Tooltip.tsx',
  'src/ui/EmptyState.tsx',
  'src/ui/DropdownMenu.tsx',
  'src/ui/Splitter.tsx',
  'src/ui/Section.tsx',
  'src/ui/FieldRow.tsx',
]

const LEGACY_UI_MODULE = [
  'Button',
  'Badge',
  'Input',
  'Dialog',
  'Tabs',
  'Tooltip',
  'EmptyState',
  'DropdownMenu',
  'Splitter',
  'Section',
  'FieldRow',
]

const REL_DEPTH_PREFIXES = [
  '../',
  '../../',
  '../../../',
  '../../../../',
  '../../../../../',
]

const LEGACY_UI_IMPORT_GROUPS = LEGACY_UI_MODULE.flatMap((name) =>
  REL_DEPTH_PREFIXES.map((prefix) => `${prefix}ui/${name}`)
)

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: LEGACY_UI_BRIDGE_FILES,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: LEGACY_UI_IMPORT_GROUPS,
              message:
                'Import UI primitives from `../ui/kit` or `../ui/canonical`, not legacy `../ui/*` bridges (Phase 5 canonical UI).',
            },
          ],
        },
      ],
    },
  },
])
