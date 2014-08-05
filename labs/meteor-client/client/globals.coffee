Handlebars.registerHelper 'equals', (a, b) -> # equals operator was dropped in Meteor's migration from Handlebars to Spacebars
  a is b

# Allow access through all templates
Handlebars.registerHelper "setInSession", (k, v) -> SessionAmplify.set k, v 
Handlebars.registerHelper "getInSession", (k) -> SessionAmplify.get k
# Allow access throughout all coffeescript/js files
@setInSession = (k, v) -> SessionAmplify.set k, v 
@getInSession = (k) -> SessionAmplify.get k

# retrieve account for selected user
@getCurrentUserFromSession = ->
  Meteor.Users.findOne("userId": getInSession("userId"))

# retrieve account for selected user
Handlebars.registerHelper "getCurrentUser", =>
	@window.getCurrentUserFromSession()

# toggle state of field in the database
@toggleCam = (event) ->
	# Meteor.Users.update {_id: context._id} , {$set:{"user.sharingVideo": !context.sharingVideo}}
  # Meteor.call('userToggleCam', context._id, !context.sharingVideo)

@toggleVoiceCall = (event) -> 
  if getInSession "isSharingAudio"
    callback = -> 
      setInSession "isSharingAudio", false # update to no longer sharing
      console.log "left voice conference"
      # sometimes we can hangup before the message that the user stopped talking is received so lets set it manually, otherwise they might leave the audio call but still be registered as talking
      Meteor.call("userStopAudio", getInSession("meetingId"),getInSession("userId"))
    webrtc_hangup callback # sign out of call
  else
    # create voice call params
    username = "#{getInSession("userId")}-bbbID-#{getUsersName()}"
    voiceBridge = "70827"
    server = null
    callback = (message) -> 
      console.log JSON.stringify message
      setInSession "isSharingAudio", true
      Meteor.call("userShareAudio", getInSession("meetingId"),getInSession("userId"))
    webrtc_call(username, voiceBridge, server, callback) # make the call

@toggleMic = (event) ->
  if getInSession "isSharingAudio" # only allow muting/unmuting if they are in the call
    console.log "toggling mute"
    u = Meteor.Users.findOne({userId:getInSession("userId")})
    if u?
      # format: meetingId, userId, requesterId, mutedBoolean
      # TODO: insert the requesterId - the user who requested the muting of userId (might be a moderator)
      Meteor.call('publishMuteRequest', u.meetingId, u.userId, u.userId, not u.user.voiceUser.muted)

# toggle state of session variable
@toggleUsersList = ->
	setInSession "display_usersList", !getInSession "display_usersList"

@toggleNavbar = ->
	setInSession "display_navbar", !getInSession "display_navbar"

@toggleChatbar = ->
  setInSession "display_chatbar", !getInSession "display_chatbar"

@toggleWhiteBoard = ->
  setInSession "display_whiteboard", !getInSession "display_whiteboard"

Meteor.methods
  sendMeetingInfoToClient: (meetingId, userId) ->
    setInSession("userId", userId)
    setInSession("meetingId", meetingId)
    setInSession("currentChatId", meetingId)
    setInSession("meetingName", null)
    setInSession("bbbServerVersion", "0.90")
    setInSession("userName", null) 
    setInSession("validUser", true) # got info from server, user is a valid user

@getUsersName = ->
  name = getInSession("userName") # check if we actually have one in the session
  if name? then name # great return it, no database query
  else # we need it from the database
    user = Meteor.Users.findOne({'userId': getInSession("userId")})
    if user?.user?.name
      setInSession "userName", user.user.name # store in session for fast access next time
      user.user.name
    else null

@getMeetingName = ->
  meetName = getInSession("meetingName") # check if we actually have one in the session
  if meetName? then meetName # great return it, no database query
  else # we need it from the database
    meet = Meteor.Meetings.findOne({})
    if meet?.meetingName
      setInSession "meetingName", meet?.meetingName # store in session for fast access next time
      meet?.meetingName
    else null

Handlebars.registerHelper "getMeetingName", ->
  window.getMeetingName()

Handlebars.registerHelper "isUserSharingVideo", (u) ->
  u.webcam_stream.length isnt 0

Handlebars.registerHelper "isCurrentUser", (id) ->
  id is getInSession("userId")

# retrieves all users in the meeting
Handlebars.registerHelper "getUsersInMeeting", ->
  Meteor.Users.find({})

Handlebars.registerHelper "isUserTalking", (u) ->
  if u? then u.voiceUser?.talking
  else return false

Handlebars.registerHelper "isUserSharingAudio", (u) ->
  if u? then u.voiceUser?.joined
  else return false

Handlebars.registerHelper "getCurrentSlide", ->
  currentPresentation = Meteor.Presentations.findOne({"presentation.current": true})
  presentationId = currentPresentation?.presentation?.id
  Meteor.Slides.find({"presentationId": presentationId, "slide.current": true})

 
# Starts the entire logout procedure.
# meeting: the meeting the user is in
# the user's userId
@userLogout = (meeting, user) ->
  Meteor.call("userLogout", meeting, user)

  # Clear the local user session and redirect them away
  setInSession("userId", null)
  setInSession("meetingId", null)
  setInSession("currentChatId", null)
  setInSession("meetingName", null)
  setInSession("bbbServerVersion", null)
  setInSession("userName", null) 
  setInSession "display_navbar", false # needed to hide navbar when the layout template renders
  
  Router.go('logout') # navigate to logout

@userKick = (meeting, user) ->
  Meteor.call("userKick", meeting, user)

@getTime = -> # returns epoch in ms
  (new Date).valueOf()
