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
      require(['views/users/users'], function(UsersView) {
		console.log("Opening users view");
      // We have no matching route, lets display the home page 
       // var usersView = UsersView;
        UsersView.render();
      });
//	  require(['views/flash/client'], function(FlashClientView) {
//		console.log("Opening main view");
//       var flashClientView = new FlashClientView();
//        flashClientView.render();
//      });
    });
    Backbone.history.start();
  };
  
  return { 
    initialize: initialize
  };

});
