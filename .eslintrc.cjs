module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', 'import'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    
    // Import/Export 규칙
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index'
        ],
        pathGroups: [
          {
            pattern: '@/**',
            group: 'internal',
            position: 'before'
          }
        ],
        pathGroupsExcludedImportTypes: ['builtin']
      }
    ],
    
    // 아키텍처 규칙 - 기본
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          // common 레이어 - 아무것도 import 불가
          {
            target: './src/common',
            from: [
              './src/global',
              './src/services', 
              './src/shared',
              './src/domain',
              './src/feature',
              './src/routes'
            ]
          },
          
          // global 레이어 - common만 import 가능
          {
            target: './src/global',
            from: [
              './src/services',
              './src/shared',
              './src/domain', 
              './src/feature',
              './src/routes'
            ]
          },
          
          // services 레이어 - common, global만 import 가능
          {
            target: './src/services',
            from: [
              './src/shared',
              './src/domain',
              './src/feature', 
              './src/routes'
            ]
          },
          
          // shared 레이어 - domain, feature, routes import 불가
          {
            target: './src/shared',
            from: [
              './src/domain',
              './src/feature',
              './src/routes'
            ]
          },
          
          // domain 레이어 - feature, routes import 불가
          {
            target: './src/domain',
            from: [
              './src/feature',
              './src/routes'
            ]
          },
          
          // feature 레이어 - routes import 불가
          {
            target: './src/feature',
            from: [
              './src/routes'
            ]
          }
        ]
      }
    ],
    
    // 도메인 간 직접 의존성 금지
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          {
            target: './src/domain/user',
            from: [
              './src/domain/product',
              './src/domain/order'
            ]
          },
          {
            target: './src/domain/product', 
            from: [
              './src/domain/user',
              './src/domain/order'
            ]
          },
          {
            target: './src/domain/order',
            from: [
              './src/domain/user',
              './src/domain/product'
            ]
          }
        ]
      }
    ],
    
    // Public API 패턴 강제
    'import/no-internal-modules': [
      'error',
      {
        allow: [
          '@/common/**',
          '@/global/**',
          '@/services/**', 
          '@/shared/**',
          '@/domain/*/index',
          '@/feature/**',
          '@/routes/**'
        ]
      }
    ]
  },
}