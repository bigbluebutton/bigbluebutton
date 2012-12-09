requirejs.config({
  baseUrl: 'js',
  shim: {
    'colorwheel': ['raphael'],
    'jquery.form': ['jquery'],
    'jquery.mousewheel': ['jquery'],
    'jquery.autosize': ['jquery'],
    'jquery.ui': ['jquery'],
    'backbone': {
      deps: ["underscore", "jquery"],
      exports: "Backbone"
    },
    'underscore': {
      exports: "_"
    }
  },
  paths: {
    'jquery': [
      'http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min',
      'lib/jquery/jquery-1.8.3.min'
    ],
    'jquery.ui': [
      'http://ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/jquery-ui.min',
      'lib/jquery/jquery-ui-1.9.2.min'
    ],
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
