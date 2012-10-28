// Filename: views/users/list
define([
  'jquery',
  'underscore',
  'backbone',
  'collections/users', 
  'views/users/user',
  'text!templates/users/users.html'
], function($, _, Backbone, UserCollection, UserView, usersTemplate){
 
  var UsersView = Backbone.View.extend({
	el: 'ul',
    initialize: function(){	       
     // UserCollection.on('add', this.addUser, this);	  
		var self = this;
		UserCollection.bind("reset", this.render, this);
		UserCollection.bind("add", function (user) {
			$(self.el).append(new UserView({model:user}).render().el);
		});
    },
    render: function(){
		console.log("*** Rendering Users View [" + UserCollection.length + "]");
		$(this.el).empty();
		_.each(UserCollection.models, function (user) {
			$(this.el).append(new UserView({model:user}).render().el);
		}, this);
		return this; 
    },
	addUser: function(user) {
		var compiledTemplate = _.template( usersTemplate);
//      this.$el.html( compiledTemplate );
		console.log("Adding user [" + user.get("username") + "]");
		var view = new UserView({model: user});
		
		this.$el.append(view.render().el);
		console.log("Rendering [" + this.$el.html() + "]");
	}
  });
  
  var usersView = new UsersView();
  
  UserCollection.on("add", usersView.render);
  
  return usersView;
});
