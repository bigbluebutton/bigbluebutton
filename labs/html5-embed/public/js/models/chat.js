define([
  'underscore',
  'backbone'
], function(_, Backbone) {
  var ChatMessageModel = Backbone.Model.extend({
    defaults: {
      userid: 'nouserid'
	  username: 'Unknown'
    },
    initialize: function(){
    }
    
  });
  return ChatMessageModel;

});
