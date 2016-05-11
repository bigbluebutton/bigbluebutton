/* jshint node: true */
'use strict';

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  // importing the Meteor settings:
  var settings = {};
  settings.dev = require('./settings-development.json');
  settings.prod = require('./settings-production.json');

  // root URL in development/production:
  var devRootURL = settings.dev.rootURL || 'http://127.0.0.1/html5client';
  var prodRootURL = settings.prod.rootURL || 'http://127.0.0.1/html5client';

  // command line string containing the Meteor's home directory in development/production:
  var devHomeStr = (settings.dev.home == undefined) ? '' : ('HOME=' + settings.dev.home + ' ');
  var prodHomeStr = (settings.prod.home == undefined) ? '' : ('HOME=' + settings.prod.home + ' ');

  // final commands:
  var meteorDevCommand = devHomeStr + 'ROOT_URL=' + devRootURL;
  meteorDevCommand += ' meteor --settings settings-development.json';

  var meteorProdCommand = prodHomeStr + 'ROOT_URL=' + prodRootURL;
  meteorProdCommand += ' meteor --settings settings-production.json';

  // configure Grunt
  grunt.initConfig({

    watch: {
      scripts: {
        files: ['**/*.js', '**/*.jsx'],
        tasks: ['force:jscs:check'],
        options: {
          event: ['all'],
          spawn: true,
        },
      },
    },

    jscs: {
      check: {
        src: ['**/*.js', '**/*.jsx', '!**/server/**', '!**/tests/**'],
        options: {
          config: '.jscsrc',
          verbose: true,
          esnext: true,
        },
      },
      autofix: {
        src: ['**/*.js', '**/*.jsx', '!**/server/**', '!**/tests/**'],
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
        command: meteorDevCommand,
      },
      start_meteor_production: {
        command: meteorProdCommand,
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

  var mode = (grunt.option('mode') == 'production') ? 'production' : 'development';

  // sets the default task to run JSCS first (forcing our way past warnings) and then start Meteor:
  grunt.registerTask('default', ['force:jscs:check', 'concurrent:meteor_watch_' + mode]);

  // sets the autofix task to fix JSCS warning when possible and then start Meteor:
  grunt.registerTask('autofix', ['force:jscs:autofix', 'concurrent:meteor_watch_' + mode]);
};
