exports.config = {
    specs: ['specs/**'],
    capabilities: [
        {
            browserName: 'firefox'
        }
    ],
    baseUrl: 'http://localhost:8080',
    framework: 'jasmine',
    reporters: ['dot'],
    screenshotPath: 'screenshots',
    logLevel: 'verbose'
};

