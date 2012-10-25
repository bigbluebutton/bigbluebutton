// Filename: views/projects/list
define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/users/list.html'
], function($, _, Backbone, userListTemplate){
  var UserListView = Backbone.View.extend({
    el: $("#page"),
    initialize: function(){
    },
    render: function(){
      var data = {};
      var compiledTemplate = _.template( userListTemplate, data );
      this.$el.html( compiledTemplate ); 
    }
  });
  return UserListView;
});
