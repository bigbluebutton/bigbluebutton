/* jshint node: true */
'use strict';

module.exports = function(grunt) {
  // configure Grunt
  grunt.initConfig({
    // files to lint with the JSHint task
    jshint: {
      files: {
        src: [
          'Gruntfile.js',
          'public/**/*.js'
        ]
      }
    },

    coffeelint: {
      files: {
        src: ['**/*.coffee','!node_modules/**/*']
      }
    }
  });

  // load the module containing the JSHint task
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-coffeelint');

  // register a default task to run JSHint
  // (allows `grunt` rather than `grunt jshint`)
  
  grunt.registerTask('default', ['jshint', 'coffeelint']);
};
