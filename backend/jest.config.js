module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/jest/**/*.test.js'],
  setupFiles: ['<rootDir>/tests/jest/setupEnv.js'],
  clearMocks: true,
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middleware/**/*.js',
    'services/**/*.js',
    'routes/**/*.js',
    '!**/node_modules/**',
  ],
};
