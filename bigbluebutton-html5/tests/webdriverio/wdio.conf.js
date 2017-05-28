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
    logLevel: 'verbose'
};

