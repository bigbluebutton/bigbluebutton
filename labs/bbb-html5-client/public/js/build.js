({
  baseUrl: '.',

  // Uncomment to turn off uglify minification.
  // optimize: 'none',

  // Stub these module after a build since they will not be needed.
  stubModules: ['cs', 'coffee-script'],

  name: 'main',
  out: 'main-dist.js',

  shim: {
    'colorwheel': ['raphael'],
    'backbone': {
      deps: ["underscore"],
      exports: "Backbone"
    },
    'underscore': {
      exports: "_"
    }
  },

  paths: {
    'cs': 'lib/require/cs',
    'coffee-script': 'lib/coffee-script',
    'globals': 'empty:',

    // TODO: r.js doesn't accept urls, so jquery can't be loaded from googleapis. For
    //       now it is being loaded directly in the html (not by require.js).
    'jquery': 'empty:',
    'jquery.ui': 'empty:',

    'jquery.mousewheel': 'lib/jquery/jquery.mousewheel.min',
    'jquery.autosize': 'lib/jquery/jquery.autosize-min',
    'jquery.form': 'lib/jquery/jquery.form',
    'raphael': 'lib/raphael/raphael.amd',
    'raphael.core': 'lib/raphael/raphael.core',
    'raphael.vml': 'lib/raphael/raphael.vml',
    'raphael.svg': 'lib/raphael/raphael.svg',
    'raphael.scale': 'lib/raphael/raphael.scale',
    'eve': 'lib/raphael/eve',
    'colorwheel': 'lib/colorwheel',
    'socket.io': 'lib/socket.io',
    'underscore': 'lib/underscore-min',
    'backbone': 'lib/backbone-min',
    'text': 'lib/require/text',
    'templates': '../templates',
  }
})
