exports.config = {
    specs: ['tests/webdriverio/specs/**/*.spec.js'],
    capabilities: [
        {
            browserName: 'chrome'
        }
    ],
    baseUrl: 'http://localhost:8080',
    framework: 'jasmine',
    reporters: ['dot'],
    screenshotPath: 'screenshots',
    logLevel: 'verbose',
    suites: {
        login: [
            'tests/webdriverio/specs/login.spec.js'
        ],
    },
};

