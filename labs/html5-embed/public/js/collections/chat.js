define([
  'jquery',
  'underscore',
  'backbone',
  'models/chat'
], function($, _, Backbone, ChatMessageModel){
  var ChatMessageCollection = Backbone.Collection.extend({
    model: ChatMessageModel,
    initialize: function(){

    }

  });
 
  return ChatMessageCollection;
});
