module.exports = function(config) {
  config.set({ 
    basepath: '',
    files: [
      'custom-event-polyfill.js',
      './tests/*.test.js'
    ],
    frameworks: ['jasmine'],
    reporters: ['dots'],
    singleRun: true
  });
};