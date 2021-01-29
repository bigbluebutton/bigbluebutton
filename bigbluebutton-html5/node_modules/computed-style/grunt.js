module.exports = function (grunt) {
  // Helper function to resolve computedStyle
  var minJs = 'dist/computedStyle.140.js';
  var validJs = 'tmp/computedStyle.valid.js';
  function getVars() {
    return {
      computedStyle: grunt.file.read(validJs),
      'computedStyle-140': grunt.file.read(minJs)
    };
  }

  // Project configuration.
  grunt.initConfig({
    // Trim out comments and whitespace
    // DEV: Uglify doesn't like partial JS scripts so this would fail
    'jsmin-sourcemap': {
      computedStyle: {
        src: 'lib/computedStyle.js',
        dest: 'tmp/computedStyle.comment_free.js'
      }
    },

    // Manually compress words for 140 bytes
    replace: {
      'computedStyle-140': {
        src: 'tmp/computedStyle.comment_free.js',
        dest: minJs,
        replacements: [{
          // Remove sourcemap comment
          from: /\/\/.*/,
          to: ''
        }, {
          // Remove line breaks
          from: /\n/g,
          to: ''
        }, {
          // Remove semicolons
          from: /([\)\]]);}/g,
          to: '$1}'
        }, {
          // Remove final semicolon
          from: /;$/,
          to: ''
        }, {
          // Various word compressions
          from: /el|prop|word|letter/g,
          to: function (word) {
            return word.charAt(0);
          }
        }, {
          // Deal with getComputedStyle individually due to localization
          from: /([^\.])getComputedStyle/g,
          to: '$1g'
        }]
      },
      'computedStyle-valid': {
        // Generate valid JS
        src: 'lib/computedStyle.js',
        dest: validJs,
        replacements: [{
          // Replace the first function with a `var`
          from: /function/,
          to: 'var computedStyle = function'
        }]
      }
    },

    // Generate templates for each flavor
    template: {
      vanilla: {
        src: 'lib/templates/vanilla.mustache.js',
        dest: 'dist/computedStyle.js',
        variables: getVars,
        engine: 'mustache'
      },
      min: {
        src: 'lib/templates/min.mustache.js',
        dest: 'dist/computedStyle.min.js',
        variables: getVars,
        engine: 'mustache'
      },
      amd: {
        src: 'lib/templates/amd.mustache.js',
        dest: 'dist/computedStyle.amd.js',
        variables: getVars,
        engine: 'mustache'
      },
      commonjs: {
        src: 'lib/templates/commonjs.mustache.js',
        dest: 'dist/computedStyle.commonjs.js',
        variables: getVars,
        engine: 'mustache'
      }
    }
  });

  // Load in grunt-templater, grunt-text-replace, and grunt-jsmin-sourcemap
  grunt.loadNpmTasks('grunt-templater');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-jsmin-sourcemap');

  // Build task
  grunt.registerTask('build', 'jsmin-sourcemap replace template');

  // Default task.
  grunt.registerTask('default', 'build');
};
