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
		var self = this;
		UserCollection.bind("reset", this.render, this);
		UserCollection.bind("add", function (user) {
			$(self.el).append(new UserView({model:user}).render().el);
		});
    },
    render: function(){
		$(this.el).empty();
		_.each(UserCollection.models, function (user) {
			$(this.el).append(new UserView({model:user}).render().el);
		}, this);
		return this; 
    }
  });
  
  var usersView = new UsersView();
  
  return usersView;
});
