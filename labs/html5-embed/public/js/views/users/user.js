// Filename: views/users/user
define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/users/user.html'
], function($, _, Backbone, userTemplate){
  var UserView = Backbone.View.extend({
    tagName:  "li",
	
    initialize: function() {
      this.model.on('change', this.render, this);
      this.model.on('destroy', this.remove, this);
    },

    render: function() {
	  console.log("Render me! [" + this.model.get("username") + "]");
	  var compiledTemplate = _.template(userTemplate, this.model);
	  console.log("user is " + compiledTemplate);
      this.$el.append(compiledTemplate);
	  console.log(this.$el.append(compiledTemplate));
      return this;
	 //return compiledTemplate;
    }
	
  });
  
  return UserView;
  
});