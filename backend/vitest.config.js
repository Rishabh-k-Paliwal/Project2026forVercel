module.exports = {
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.js'],
    clearMocks: true,
    restoreMocks: true,
  },
};
