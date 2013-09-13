define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/home/main.html'
], function($, _, Backbone, mainHomeTemplate){

  var MainHomeView = Backbone.View.extend({
    el: $("#presentation"),
    render: function(){
      this.$el.html(mainHomeTemplate);
    }
  });
  return MainHomeView;
});
