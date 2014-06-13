# Allow access through all templates
Handlebars.registerHelper "setInSession", (k, v) -> Session.set k, v
Handlebars.registerHelper "getInSession", (k) -> Session.get k
# Allow access throughout all coffeescript/js files
@setInSession = (k, v) -> Session.set k, v
@getInSession = (k) -> Session.get k

# retrieve account for selected user, or the first mod account if nothing is selected
# global function
@getCurrentUserFromSession = ->
  id = Session.get("userId") or "a1a1a1a1a1a1"
  Meteor.users.findOne("user.userId": id)

# retrieve account for selected user
Handlebars.registerHelper "getCurrentUser", =>
	@window.getCurrentUserFromSession()

# toggle state of field in the database
@toggleCam = (context) ->
	Meteor.users.update {_id: context._id} , {$set:{"user.sharingVideo": !context.user.sharingVideo}}

@toggleMic = (context) -> 
	Meteor.users.update {_id: context._id} , {$set:{"user.sharingAudio": !context.user.sharingAudio}}

# toggle state of session variable
@toggleUsersList = ->
	setInSession "display_usersList", !getInSession "display_usersList" # toggle current state

@toggleNavbar = ->
	setInSession "display_navbar", !getInSession "display_navbar" # toggle current state