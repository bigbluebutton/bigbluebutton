# Allow access through all templates
Handlebars.registerHelper "setInSession", (k, v) -> Session.set k, v
Handlebars.registerHelper "getInSession", (k) -> Session.get k
# Allow access throughout all coffeescript/js files
@setInSession = (k, v) -> Session.set k, v
@getInSession = (k) -> Session.get k

# retrieve account for selected user
@getCurrentUserFromSession = ->
  Meteor.Users.findOne("userId": Session.get("userId"))

# retrieve account for selected user
Handlebars.registerHelper "getCurrentUser", =>
	@window.getCurrentUserFromSession()

# toggle state of field in the database
@toggleCam = (context) ->
	# Meteor.Users.update {_id: context._id} , {$set:{"user.sharingVideo": !context.sharingVideo}}
  # Meteor.call('userToggleCam', context._id, !context.sharingVideo)

@toggleMic = (context) -> 
	# Meteor.Users.update {_id: context._id} , {$set:{"user.sharingAudio": !context.sharingAudio}}
  # Meteor.call('userToggleMic', context._id, !context.sharingAudio)

# toggle state of session variable
@toggleUsersList = ->
	setInSession "display_usersList", !getInSession "display_usersList"

@toggleNavbar = ->
	setInSession "display_navbar", !getInSession "display_navbar"

@toggleChatbar = ->
	setInSession "display_chatbar", !getInSession "display_chatbar"

Meteor.methods
  sendMeetingInfoToClient: (meetingId, userId) ->
    Session.set("userId", userId)
    Session.set("meetingId", meetingId)
    Session.set("meetingName", "Demo Meeting")
    Session.set("bbbServerVersion", "0.90")
    Session.set("userName", "sample user name")

Handlebars.registerHelper "isUserSharingAudio", (u) ->
  u.voiceUser.talking

Handlebars.registerHelper "isUserSharingVideo", (u) ->
  u.webcam_stream.length isnt 0

# should be changed to find all users listed in the meeting and retrieve them,
# instead of here where we retrieve every user pointing to the meeting 
Handlebars.registerHelper "getUsersInMeeting", ->
  Meteor.Users.find()
