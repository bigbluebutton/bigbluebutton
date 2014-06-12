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
  	
    initialize:  ->
      #alert("iiiiiinitialize"+newUserid+" "+newUsername)
    	console.log "creation"
      
    isValid: ->
      console.log "inside is valid- id: #{@id} userid: #{@userid} username: #{@username}"
      value = @id? and @userid? and @username?

    render: ->
	  	_.template(userTemplate, {userID: @userid, username: @username})


  UserModel