define([
  'underscore',
  'backbone'
], function(_, Backbone) {
  var UserModel = Backbone.Model.extend({
    defaults: {
      name: "Asyong"
    },
    initialize: function(){
    }
    
  });
  return UserModel;

});