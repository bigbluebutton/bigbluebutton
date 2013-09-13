define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/flash/client.html'
], function($, _, Backbone, flashClientTemplate){

  var FlashClientView = Backbone.View.extend({
    el: $("#content"),
    render: function(){
      this.$el.html(flashClientTemplate);
    }
  });
  return FlashClientView;
});