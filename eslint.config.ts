import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.nuxt/**',
      '**/.output/**',
      '**/.vite/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'deprecated_files/**',
      'deprecated_css_backup/**'
    ],
  },

  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  // 測試檔案的寬鬆規則
  {
    files: ['tests/**/*.{ts,spec.ts}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
    }
  },

  // BEM 命名規範驗證
  {
    files: ['**/*.vue'],
    rules: {
      'vue/attribute-hyphenation': ['error', 'always'],
      'vue/component-name-in-template-casing': ['error', 'kebab-case'],
      // 自定義規則：建議使用 BEM 命名法
      'vue/no-unused-vars': 'warn'
    },
    settings: {
      // BEM 命名模式說明
      'bem-patterns': {
        block: /^[a-z][a-z0-9-]*[a-z0-9]$/,
        element: /^[a-z][a-z0-9-]*[a-z0-9]__[a-z][a-z0-9-]*[a-z0-9]$/,
        modifier: /^[a-z][a-z0-9-]*[a-z0-9](__|-)([a-z][a-z0-9-]*[a-z0-9])--[a-z][a-z0-9-]*[a-z0-9]$/
      }
    }
  }
)
