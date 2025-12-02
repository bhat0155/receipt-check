/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  // Where Jest should look for test files:
  testMatch: ["**/__tests__/**/*.test.ts"],
  // Ignore built files
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
};