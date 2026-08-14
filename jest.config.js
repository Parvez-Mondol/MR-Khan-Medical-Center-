module.exports = {
  testEnvironment: 'node',
  testTimeout: 20000,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
};

// Enforce coverage thresholds only when explicitly requested (CI or ENFORCE_COVERAGE=true)
if (process.env.CI === 'true' || process.env.ENFORCE_COVERAGE === 'true') {
  module.exports.coverageThreshold = {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  };
}
