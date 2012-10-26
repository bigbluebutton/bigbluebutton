// Filename: views/users/list
define([
  'jquery',
  'underscore',
  'backbone',
  'collections/users', 
  'text!templates/users/list.html'
], function($, _, Backbone, UserCollection, userListTemplate){
  var UserListView = Backbone.View.extend({
    el: $("#users"),
    initialize: function(){
	  this.collection = new UserCollection();
     // this.collection.bind("add", this.exampleBind);
      this.collection = this.collection.add({ userid: "u1", username: "Richard"});
      this.collection = this.collection.add({ userid: "u2", username: "Jesus"});
      this.collection = this.collection.add({ userid: "u3", username: "Fred"});
    },
	exampleBind: function( model ){
      console.log("Example Bind [" + model.username + "]");
    },
    render: function(){
      var data = {
        users: this.collection.models
      };
      var compiledTemplate = _.template( userListTemplate, data );
      this.$el.html( compiledTemplate ); 
    }
  });
  return UserListView;
});
