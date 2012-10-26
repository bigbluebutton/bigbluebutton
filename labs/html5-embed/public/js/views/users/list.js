// Filename: views/users/list
define([
  'jquery',
  'underscore',
  'backbone',
  'collections/users', 
  'text!templates/users/list.html'
], function($, _, Backbone, UserCollection, userListTemplate){

  
  
  var UsersView = Backbone.View.extend({	
    el: $("#users"),
    initialize: function(){	       
 //     UserCollection.add({ userid: "u1", username: "Richard"});
  //    UserCollection.add({ userid: "u2", username: "Jesus"});
  //    UserCollection.add({ userid: "u3", username: "Fred"});	  
    },
	exampleBind: function( model ){
      console.log("Example Bind [" + model.get("userid") + ", " + model.get("username") + "]");
	  this.render();
    },
    render: function(){
		console.log("*** Rendering Users View [" + UserCollection.length + "]");
      var data = {
        users: UserCollection.models
      };
      var compiledTemplate = _.template( userListTemplate, data );
      this.$el.html( compiledTemplate ); 
    }
  });
  
  var usersView = new UsersView();
  
  UserCollection.on("add", usersView.render);
  
  return usersView;
});
