const path = require("path");

module.exports = {
  preset: 'ts-jest',
  testEnvironment: "jsdom",
  roots: ["./src"],
  collectCoverage: true,
  coverageReporters: ["json", "lcov", "text", "json-summary"],
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/types.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/tests/e2e/**/*',
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  coveragePathIgnorePatterns: ["/node_modules/", "\\.test\\.ts$", "/tests/e2e/"],
  coverageProvider: "v8",
  moduleDirectories: ["node_modules"],
  setupFiles: ["<rootDir>/src/tests/mocks/chrome.ts", "<rootDir>/src/tests/setup.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/tests/e2e/"],
  testEnvironmentOptions: {
    url: "http://localhost/"
  },
  rootDir: __dirname,
  coverageThreshold: {
    global: {
      lines: 80,
      statements: 80,
      branches: 80,
      functions: 80,
    },
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        esModuleInterop: true
      }
    }]
  }
};
