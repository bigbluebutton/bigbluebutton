exports.config = {
    specs: ['specs/**'],
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

