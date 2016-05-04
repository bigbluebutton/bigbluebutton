/* jshint node: true */
'use strict';

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  // importing the Meteor settings:
  var settings_dev = require('./settings-development.json');
  var settings_prod = require('./settings-production.json');

  // root URL in development/production:
  var devRootURL = (settings_dev.rootURL == undefined) ? 'http://127.0.0.1/html5client' : settings_dev.rootURL;
  var prodRootURL = (settings_prod.rootURL == undefined) ? 'http://127.0.0.1/html5client' : settings_prod.rootURL;

  // command line string containing the Meteor's home directory in development/production:
  var devHomeStr = (settings_dev.home == undefined) ? '' : ('HOME=' + settings_dev.home + ' ');
  var prodHomeStr = (settings_prod.home == undefined) ? '' : ('HOME=' + settings_prod.home + ' ');

  // final commands:
  var meteor_dev_command = devHomeStr + 'ROOT_URL=' + devRootURL + ' meteor --settings settings-development.json';
  var meteor_prod_command = prodHomeStr + 'ROOT_URL=' + prodRootURL + ' meteor --settings settings-production.json';

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
        command: meteor_dev_command,
      },
      start_meteor_production: {
        command: meteor_prod_command,
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
