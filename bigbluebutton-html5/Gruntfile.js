/* jshint node: true */
'use strict';

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  // importing the Meteor settings:
  var SHELL_CONFIG = require('./private/config/server/shell.yaml');
  var PROD_SHELL_CONFIG = require('./private/config/production/server/shell.yaml');

  // root URL in development/production:
  var rootURL = (SHELL_CONFIG.shell.rootURL == undefined)
    ? 'http://127.0.0.1/html5client'
    : SHELL_CONFIG.shell.rootURL;

  // command line string containing the Meteor's home directory in production:
  var prodHomeStr = (PROD_SHELL_CONFIG.shell.home == undefined) ? ''
                        : ('HOME=' + PROD_SHELL_CONFIG.shell.home + ' ');

  // final commands:
  var METEOR_DEV_COMMAND = 'ROOT_URL=' +
    rootURL + ' NODE_ENV=development' + ' meteor';
  var METEOR_PROD_COMMAND = prodHomeStr + 'ROOT_URL=' +
    rootURL + ' NODE_ENV=production' + ' meteor';

  // configure Grunt
  grunt.initConfig({

    watch: {
      scripts: {
        files: ['**/*.js', '**/*.jsx'],
        tasks: ['force:newer:jscs:check'],
        options: {
          event: ['all'],
          spawn: true,
        },
      },
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
      autofix: {
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
      start_meteor_development: {
        command: METEOR_DEV_COMMAND,
      },
      start_meteor_production: {
        command: METEOR_PROD_COMMAND,
      },
    },

    concurrent: {
      options: {
        logConcurrentOutput: true,
        limit: 3,
      },
      meteor_watch_development: {
        tasks: ['shell:start_meteor_development', 'watch'],
      },
      meteor_watch_production: {
        tasks: ['shell:start_meteor_production', 'watch'],
      },
    },
  });

  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-force-task');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-newer');

  var mode = (grunt.option('mode') == 'production') ? 'production' : 'development';

  // sets the default task to run JSCS first (forcing our way past warnings) and then start Meteor:
  grunt.registerTask('default', ['force:newer:jscs:check', 'concurrent:meteor_watch_' + mode]);

  // sets the autofix task to fix JSCS warning when possible and then start Meteor:
  grunt.registerTask('autofix', ['force:newer:jscs:autofix', 'concurrent:meteor_watch_' + mode]);

  // runs the linter task:
  grunt.registerTask('quicklint', ['force:jscs:check']);

  // runs the linter task and autofixes errors when possible:
  grunt.registerTask('quickfix', ['force:jscs:autofix']);
};
