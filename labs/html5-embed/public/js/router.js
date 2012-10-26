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
      require(['views/users/list'], function(UserListView) {
		console.log("Opening main view");
      // We have no matching route, lets display the home page 
        var usersView = new UserListView();
        usersView.render();
      });
    });
    Backbone.history.start();
  };
  return { 
    initialize: initialize
  };
});
