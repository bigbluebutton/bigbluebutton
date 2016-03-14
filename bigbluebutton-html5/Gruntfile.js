/* jshint node: true */
'use strict';

//require('load-grunt-tasks')(grunt);

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  // configure Grunt
  grunt.initConfig({
    // files to lint with the JSHint task
    jshint: {
      files: {
        src: [
          'Gruntfile.js'
        ]
      }
    },

    coffeelint: {
      files: {
        src: [
          '**/*.coffee',
          '!node_modules/**/*',
          '!app/.meteor/**/*',
          '!app/packages/**/*'
        ]
      }
    },

    jscs: {
      check: {
        src: ['**/*.js', '**/*.jsx'],
        options: {
          config: '.jscsrc',
          verbose: true,
          esnext: true,
        },
      },
      fix: {
        src: ['**/*.js', '**/*.jsx'],
        options: {
          config: '.jscsrc',
          verbose: true,
          esnext: true,
          fix: true,
        },
      },
    },

    shell: {
      start_meteor: {
        command: 'HOME=/usr/share/meteor JASMINE_SERVER_UNIT=0 JASMINE_SERVER_INTEGRATION=0 JASMINE_CLIENT_INTEGRATION=0 JASMINE_BROWSER=PhantomJS JASMINE_MIRROR_PORT=3000 ROOT_URL=http://127.0.0.1/html5client meteor'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-coffeelint');
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-force-task');

  // sets the default task to run JSCS first (forcing our way past warnings) and then start Meteor:
  grunt.registerTask('default', ['force:jscs:check', 'shell:start_meteor']);

  // sets the autofix task to fix JSCS warning when possible and then start Meteor:
  grunt.registerTask('autofix', ['force:jscs:fix', 'shell:start_meteor']);
};
