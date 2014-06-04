define [
  'underscore',
  'backbone',
  'globals'
  'text!templates/user.html'
], (_, Backbone, globals, userTemplate) ->

  UserModel = Backbone.Model.extend

  	defaults: 
      id : null
	  	userid: null
	  	username: null
  	
    initialize: ->
    	#alert "creation"

    render: ->
	  	compiledTemplate = _.template(userTemplate, {userID: @userid, username: @username})


  UserModel