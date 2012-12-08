requirejs.config({
  baseUrl: 'js/lib',
  shim: {
    'colorwheel': ['raphael'],
    'jquery.form': ['jquery'],
    'jquery.mousewheel': ['jquery'],
    'jquery.autosize': ['jquery'],
    'jquery.ui': ['jquery']
  },
  paths: {
    'jquery': 'http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min',
    'raphael': 'raphael.amd',
    'colorwheel': 'colorwheel',
    'jquery.mousewheel': 'jquery.mousewheel.min',
    'jquery.autosize': 'jquery.autosize-min',
    'jquery.form': 'jquery.form',
    'jquery.ui': 'jq-ui',
    'socket.io': '/socket.io/socket.io',
    'textflow': 'textflow',
    'textflow-helper': 'textflow-helper',
    'eve': 'eve',
    'chat': '../chat'
  }
});

require([
  'jquery',
  'jquery.mousewheel',
  'jquery.autosize',
  'jquery.form',
  'jquery.ui',
  'socket.io',
  'raphael',
  'colorwheel',
  'textflow',
  'textflow-helper',
  'chat/whiteboard',
  'chat/chat',
  'chat/behaviour',
  'chat/connection'
]);
