Handlebars.registerHelper 'equals', (a, b) -> # equals operator was dropped in Meteor's migration from Handlebars to Spacebars
  a is b

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
    Session.set("currentChatId", meetingId)
    Session.set("meetingName", null)
    Session.set("bbbServerVersion", "0.90")
    Session.set("userName", null) 

@getUsersName = ->
  name = Session.get("userName") # check if we actually have one in the session
  if name? then name # great return it, no database query
  else # we need it from the database
    user = Meteor.Users.findOne({'userId': Session.get("userId")})
    if user?.user?.name
      Session.set "userName", user.user.name # store in session for fast access next time
      user.user.name
    else null

@getMeetingName = ->
  meetName = Session.get("meetingName") # check if we actually have one in the session
  if meetName? then meetName # great return it, no database query
  else # we need it from the database
    meet = Meteor.Meetings.findOne({})
    if meet?.meetingName
      Session.set "meetingName", meet?.meetingName # store in session for fast access next time
      meet?.meetingName
    else null

Handlebars.registerHelper "getMeetingName", ->
  window.getMeetingName()

Handlebars.registerHelper "isUserSharingAudio", (u) ->
  u.voiceUser.talking

Handlebars.registerHelper "isUserSharingVideo", (u) ->
  u.webcam_stream.length isnt 0

Handlebars.registerHelper "isCurrentUser", (id) ->
  id is Session.get "userId"

# retrieves all users in the meeting
Handlebars.registerHelper "getUsersInMeeting", ->
  Meteor.Users.find({})

@getTime = -> # returns epoch in ms
  (new Date).valueOf()
