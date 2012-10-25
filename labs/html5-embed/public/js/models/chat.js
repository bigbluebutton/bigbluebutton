define([
  'underscore',
  'backbone'
], function(_, Backbone) {
  var ChatMessageModel = Backbone.Model.extend({
    defaults: {
      score: 10
    },
    initialize: function(){
    }
    
  });
  return ChatMessageModel;

});
