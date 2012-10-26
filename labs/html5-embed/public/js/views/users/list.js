// Filename: views/users/list
define([
  'jquery',
  'underscore',
  'backbone',
  'collections/users', 
  'views/users/user'
], function($, _, Backbone, UserCollection, UserView){
 
  var UsersView = Backbone.View.extend({
	el: $("#users-list"),
    initialize: function(){	       
      UserCollection.on('add', this.addUser, this);	  
    },
    render: function(){
		console.log("*** Rendering Users View [" + UserCollection.length + "]");
      var data = {
        users: UserCollection.models
      };
//      var compiledTemplate = _.template( userListTemplate, data );
//      this.$el.html( compiledTemplate ); 
    },
	addUser: function(user) {
		console.log("Adding user [" + user.get("username") + "]");
		var view = new UserView({model: user});
		console.log("Rendering [" + view.render().el.html() + "]");
		this.$el.append('<li>Hello</li>');
	}
  });
  
  var usersView = new UsersView();
  
  UserCollection.on("add", usersView.render);
  
  return usersView;
});
