define([
  'jquery',
  'underscore',
  'backbone',
  'models/user'
], function($, _, Backbone, UserModel){
  var UserCollection = Backbone.Collection.extend({
    model: UserModel,
    initialize: function(){
	  var self = this;
	  BBB.listen("UserLeftEvent", function(bbbEvent) {
		console.log("User [" + bbbEvent.userID + "] has left.");		
	  });
	  BBB.listen("UserJoinedEvent", function(bbbEvent) {
		console.log("User [" + bbbEvent.userID + ", " + bbbEvent.userName + "] has joined.");
		self.add(new UserModel({ userid: bbbEvent.userID, username: bbbEvent.userName}));
	  });
    }
  });
  
  var userCollection = new UserCollection();
  
  return userCollection;
});
