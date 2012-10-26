define([
  'jquery',
  'underscore',
  'backbone',
  'models/user'
], function($, _, Backbone, UserModel){
  var UserCollection = Backbone.Collection.extend({
    model: UserModel,
    initialize: function(){

    }

  });
 
  return UserCollection;
});
