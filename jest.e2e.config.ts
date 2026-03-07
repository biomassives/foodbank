import type { Config } from 'jest';

// Separate Jest config for Puppeteer e2e tests.
// Run with: npm run test:e2e
// To target a deployment: BASE_URL=https://my-app.vercel.app npm run test:e2e

const config: Config = {
  preset: 'jest-puppeteer',
  testMatch: ['**/tests/e2e/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  testTimeout: 30000,
  // These globals are injected by jest-puppeteer (page, browser, context)
  globals: {},
};

export default config;
