/* jshint node: true */
'use strict';

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  // configure Grunt
  grunt.initConfig({

    watch: {
      scripts: {
        files: ['**/*.js', '**/*.jsx'],
        tasks: ['force:jscs:check'],
        options: {
          event: ['all'],
          spawn: true
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
      start_meteor_development: {
        command: 'HOME=/usr/share/meteor JASMINE_SERVER_UNIT=0 JASMINE_SERVER_INTEGRATION=0 JASMINE_CLIENT_INTEGRATION=0 JASMINE_BROWSER=PhantomJS JASMINE_MIRROR_PORT=3000 ROOT_URL=http://127.0.0.1/html5client meteor --settings settings-development.json',
      },
      start_meteor_production: {
        command: 'HOME=/usr/share/meteor JASMINE_SERVER_UNIT=0 JASMINE_SERVER_INTEGRATION=0 JASMINE_CLIENT_INTEGRATION=0 JASMINE_BROWSER=PhantomJS JASMINE_MIRROR_PORT=3000 ROOT_URL=http://127.0.0.1/html5client meteor --settings settings-production.json',
      }
    },

    concurrent: {
      options: {
        logConcurrentOutput: true,
        limit: 3,
      },
      meteor_watch_development: {
        tasks: ['shell:start_meteor_development', 'watch']
      },
      meteor_watch_production: {
        tasks: ['shell:start_meteor_production', 'watch']
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-coffeelint');
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-force-task');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-concurrent');

  var mode = grunt.option('mode') || 'development';

  // sets the default task to run JSCS first (forcing our way past warnings) and then start Meteor:
  grunt.registerTask('default', ['force:jscs:check', 'concurrent:meteor_watch_' + mode]);

  // sets the autofix task to fix JSCS warning when possible and then start Meteor:
  grunt.registerTask('autofix', ['force:jscs:autofix', 'concurrent:meteor_watch_' + mode]);
};
