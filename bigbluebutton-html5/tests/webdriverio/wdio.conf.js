require('dotenv').config({ path: './tests/webdriverio/.testing-env' });

exports.config = {
  specs: ['tests/webdriverio/specs/**/*.spec.js'],
  capabilities: [{
    browserName: 'chrome',
  }],
  services: ['devtools'],
  framework: 'jasmine',
  reporters: ['spec'],
};
