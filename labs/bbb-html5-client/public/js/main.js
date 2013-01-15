requirejs.config({
  waitSeconds: 60,
  baseUrl: 'js',
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
    // jQuery is being loaded in the html before this because it is necessary
    // in production (see build.js). It's kept here so the scripts can require
    // it with require.js
    'jquery': 'http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min',
    'jquery.ui': 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/jquery-ui.min',

    'jquery.mousewheel': 'lib/jquery/jquery.mousewheel.min',
    'jquery.autosize': 'lib/jquery/jquery.autosize-min',
    'jquery.form': 'lib/jquery/jquery.form',
    'raphael': 'lib/raphael/raphael.amd',
    'raphael.core': 'lib/raphael/raphael.core',
    'raphael.vml': 'lib/raphael/raphael.vml',
    'raphael.svg': 'lib/raphael/raphael.svg',
    'eve': 'lib/raphael/eve',
    'colorwheel': 'lib/colorwheel',
    'coffee-script': 'lib/coffee-script',
    'socket.io': '/socket.io/socket.io',
    'underscore': 'lib/underscore-min',
    'backbone': 'lib/backbone-min',
    'cs': 'lib/require/cs',
    'text': 'lib/require/text',
    'templates': '../templates',
  }
});

require([
  'cs!app',
  'coffee-script'
], function(App){
  App.initialize();
});
