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
    'jquery': [
      'http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min',
      'jquery-1.8.3.min'
    ],
    'jquery.ui': [
      'http://ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/jquery-ui.min',
      'jquery-ui-1.9.2.min'
    ],
    'raphael': 'raphael.amd',
    'jquery.mousewheel': 'jquery.mousewheel.min',
    'jquery.autosize': 'jquery.autosize-min',
    'socket.io': '/socket.io/socket.io',
    'chat': '../chat'
  }
});

require([
  'coffee-script',
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
  'cs!chat/connection',
  'cs!chat/whiteboard',
  'cs!chat/chat',
  'cs!chat/behaviour'
]);
