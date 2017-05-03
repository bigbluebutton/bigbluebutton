'use strict';

/* For jshint: */
/* globals module, require */

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    githooks: {
      all: {
        'pre-commit': 'jshint jscs'
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      files: ['adapter.js', 'test/*.js']
    },
    jscs: {
      src: ['adapter.js', 'test/*.js'],
      options: {
        config: '.jscsrc',
        'excludeFiles': [
        ]
      }
    },
    testling: {
      files: 'test/test.js'
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-githooks');
  grunt.registerTask('verify-require', 'Verifies the script can be required in a node context', function () {
      require('./adapter');
  });
  grunt.registerTask('default', ['jshint', 'jscs', 'verify-require']);
};
