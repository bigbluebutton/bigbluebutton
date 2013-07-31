// Filename: views/projects/list
define([
  'jquery',
  'underscore',
  'backbone',
  'collections/chat',
  'text!templates/chat/list.html'
], function($, _, Backbone, ChatMessagesCollection, chatMessageListTemplate){
  var chatListView = Backbone.View.extend({
    el: $("#page"),
    initialize: function(){
      this.collection = new ChatMessagesCollection();
      this.collection.bind("add", this.exampleBind);
      this.collection = this.collection.add({ name: "Twitter"});
      this.collection = this.collection.add({ name: "Facebook"});
      this.collection = this.collection.add({ name: "Myspace", score: 20});
    },
    exampleBind: function( model ){
      //console.log(model);
    },
    render: function(){
      var data = {
        chatMessages: this.collection.models,
        _: _ 
      };
      var compiledTemplate = _.template( chatMessageListTemplate, data );
      this.$el.html( compiledTemplate ); 
    }
  });
  return chatListView;
});
