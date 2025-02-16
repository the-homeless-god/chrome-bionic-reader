const path = require("path");

module.exports = {
  testEnvironment: "jsdom",
  roots: ["./extension", "./tests"],
  collectCoverage: true,
  coverageReporters: ["json", "lcov", "text", "json-summary"],
  coverageDirectory: "coverage",
  collectCoverageFrom: ["<rootDir>/./extension/*.js"],
  moduleNameMapper: {
    "^./extension/(.*)$": "<rootDir>/./extension/$1",
  },
  coveragePathIgnorePatterns: ["/node_modules/", "\\.test\\.js$"],
  coverageProvider: "v8",
  moduleDirectories: ["node_modules"],
  setupFiles: ["<rootDir>/tests/mocks/chrome.js"],
  testPathIgnorePatterns: ["/node_modules/"],
  testEnvironmentOptions: {
    url: "http://localhost/"
  },
  rootDir: __dirname,
  coverageThreshold: {
    global: {
      lines: 100,
      statements: 100,
      branches: 100,
      // TODO: fix coverage
      functions: 97.05,
    },
  },
};
