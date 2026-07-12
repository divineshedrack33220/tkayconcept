module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/', '/__tests__/setup\\.js$'],
  forceExit: true,
  detectOpenHandles: true,
  verbose: true,
};
