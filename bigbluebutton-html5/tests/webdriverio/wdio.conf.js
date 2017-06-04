exports.config = {
  specs: ['tests/webdriverio/specs/**/*.spec.js'],
  capabilities: [
    {
      browserName: 'chrome',
    },
  ],
  baseUrl: 'http://localhost:8080',
  framework: 'jasmine',
  reporters: ['spec', 'junit'],
  reporterOptions: {
    junit: {
      outputDir: './tests/webdriverio/reports'
    },
  },
  screenshotPath: 'screenshots',
  suites: {
    login: [
      'tests/webdriverio/specs/login.spec.js',
    ],
  },
};

