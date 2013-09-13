define([
  'underscore',
  'backbone'
], function(_, Backbone) {
  var UserModel = Backbone.Model.extend({
    defaults: {
      userid: 'nouserid',
	  username: 'Unknown'
    },
    initialize: function(){
    }
    
  });
  return UserModel;

});