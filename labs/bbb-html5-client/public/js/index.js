requirejs.config({
  baseUrl: 'js/lib',
  paths: {
    'jquery': [
      'http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min',
      'jquery-1.8.3.min'
    ],
    'index': '../index'
  }
});

require([
  'coffee-script',
  'jquery',
  'cs!index/validation',
]);
