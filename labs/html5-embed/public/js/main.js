// Filename: main.js

// Configure shortcut alias
require.config({
  paths: {
    jquery: 'libs/jquery/jquery-min',
    underscore: 'libs/underscore/underscore-min',
    backbone: 'libs/backbone/backbone-min',
	swfobject: 'libs/swfobject/swfobject',
    templates: '../templates'
  }

});

require([
  'app',
], function(App){
  App.initialize();
});
