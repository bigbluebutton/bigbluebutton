// Filename: router.js
define([
  'jquery',
  'underscore',
  'backbone'
], function($, _, Backbone ){
  var AppRouter = Backbone.Router.extend({
    routes: {      
      // Default. We only have one route.
      '*actions': 'defaultAction'
    }
  });
  var initialize = function(){
    var app_router = new AppRouter;
    app_router.on('route:defaultAction', function (actions) {
      require(['views/home/main'], function(MainHomeView) {
		console.log("Opening main view");
      // We have no matching route, lets display the home page 
        var mainHomeView = new MainHomeView();
        mainHomeView.render();
      });
    });
    Backbone.history.start();
  };
  return { 
    initialize: initialize
  };
});
