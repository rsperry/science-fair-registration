module.exports = {
  projects: [
    {
      displayName: 'backend',
      preset: 'ts-jest',
      testEnvironment: 'node',
      rootDir: './backend',
      roots: ['<rootDir>/tests'],
      testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
      moduleFileExtensions: ['ts', 'js', 'json'],
      collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.test.ts',
        '!src/**/*.spec.ts',
      ],
    },
    {
      displayName: 'frontend',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      rootDir: './frontend',
      roots: ['<rootDir>/tests'],
      testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
      collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/main.tsx',
        '!src/vite-env.d.ts',
      ],
      transform: {
        '^.+\\.tsx?$': ['ts-jest', {
          tsconfig: {
            jsx: 'react-jsx',
            esModuleInterop: true,
          },
        }],
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
      testTimeout: 30000,
    },
  ],
  coverageDirectory: './coverage',
  coverageReporters: ['json-summary', 'text', 'lcov'],
  maxWorkers: 1,
  coverageThreshold: {
    global: {
      branches: 93,
      functions: 93,
      lines: 95,
      statements: 95,
    },
  },
};
