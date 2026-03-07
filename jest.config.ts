
  import type {Config} from 'jest';

  const config: Config = {
    preset: 'ts-jest',
    transform: {
      '^.+\\.jsx?$': 'babel-jest',
      '^.+\\.vue$': '@vue/vue3-jest',
      '^.+\\.tsx?$': 'ts-jest',
    },
    testEnvironment: 'jsdom',
    testEnvironmentOptions: {
      customExportConditions: ['node', 'node-addons'],
    },
    moduleFileExtensions: ['vue', 'js', 'json', 'jsx', 'ts', 'tsx', 'node'],
    moduleNameMapper: {
      '^src/(.*)$': '<rootDir>/src/$1',
    },
    setupFiles: ['<rootDir>/tests/setup.ts'],
    // e2e tests require Puppeteer — run separately via `npm run test:e2e`
    testPathIgnorePatterns: ['/node_modules/', '/tests/e2e/'],
  };

  export default config;
