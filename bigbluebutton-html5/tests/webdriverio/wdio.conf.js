exports.config = {
  specs: ['tests/webdriverio/specs/**/*.spec.js'],
  capabilities: [{
    browserName: 'chrome',
  }],
  services: ['devtools'],
  framework: 'jasmine',
  reporters: ['spec'],
  baseUrl: '',
};
