# Convert a color `value` as integer to a hex color (e.g. 255 to #0000ff)
@colourToHex = (value) ->
	hex = parseInt(value).toString(16)
	hex = "0" + hex while hex.length < 6
	"##{hex}"

@currentUserIsMuted = ->
  return Meteor.Users.findOne({_id: getInSession "DBID"})?.user?.voiceUser?.muted

# color can be a number (a hex converted to int) or a string (e.g. "#ffff00")
@formatColor = (color) ->
  color ?= "0" # default value
  if !color.toString().match(/\#.*/)
    color = colourToHex(color)
  color

# thickness can be a number (e.g. "2") or a string (e.g. "2px")
@formatThickness = (thickness) ->
  thickness ?= "1" # default value
  if !thickness.toString().match(/.*px$/)
    "#" + thickness + "px" # leading "#" - to be compatible with Firefox
  thickness

@getCurrentSlideDoc = -> # returns only one document
  currentPresentation = Meteor.Presentations.findOne({"presentation.current": true})
  presentationId = currentPresentation?.presentation?.id
  currentSlide = Meteor.Slides.findOne({"presentationId": presentationId, "slide.current": true})

# retrieve account for selected user
@getCurrentUserFromSession = ->
  Meteor.Users.findOne("_id": getInSession("userId"))

@getInSession = (k) -> SessionAmplify.get k

@getMeetingName = ->
  meetName = getInSession("meetingName") # check if we actually have one in the session
  if meetName? then meetName # great return it, no database query
  else # we need it from the database
    meet = Meteor.Meetings.findOne({})
    if meet?.meetingName
      setInSession "meetingName", meet?.meetingName # store in session for fast access next time
      meet?.meetingName
    else "your meeting"

@getTime = -> # returns epoch in ms
  (new Date).valueOf()

@getTimeOfJoining = ->
  Meteor.Users.findOne(_id: getInSession "DBID")?.user?.time_of_joining

@getUsersName = ->
  name = getInSession("userName") # check if we actually have one in the session
  if name? then name # great return it, no database query
  else # we need it from the database
    user = Meteor.Users.findOne({'_id': getInSession("DBID")})
    if user?.user?.name
      setInSession "userName", user.user.name # store in session for fast access next time
      user.user.name
    else null

@getPresentationFilename = ->
  currentPresentation = Meteor.Presentations.findOne({"presentation.current": true})
  currentPresentation?.presentation?.name

Handlebars.registerHelper "colourToHex", (value) =>
  @window.colourToHex(value)

Handlebars.registerHelper 'equals', (a, b) -> # equals operator was dropped in Meteor's migration from Handlebars to Spacebars
  a is b

Handlebars.registerHelper "getCurrentMeeting", ->
  Meteor.Meetings.findOne()

Handlebars.registerHelper "getCurrentSlide", ->
  currentPresentation = Meteor.Presentations.findOne({"presentation.current": true})
  presentationId = currentPresentation?.presentation?.id
  Meteor.Slides.find({"presentationId": presentationId, "slide.current": true})

# retrieve account for selected user
Handlebars.registerHelper "getCurrentUser", =>
  @window.getCurrentUserFromSession()

# Allow access through all templates
Handlebars.registerHelper "getInSession", (k) -> SessionAmplify.get k

Handlebars.registerHelper "getMeetingName", ->
  window.getMeetingName()

Handlebars.registerHelper "getShapesForSlide", ->
  currentSlide = getCurrentSlideDoc()

  # try to reuse the lines above
  Meteor.Shapes.find({whiteboardId: currentSlide?.slide?.id})

# retrieves all users in the meeting
Handlebars.registerHelper "getUsersInMeeting", ->
  Meteor.Users.find({})

Handlebars.registerHelper "getWhiteboardTitle", ->
  "Whiteboard: " + getPresentationFilename()

Handlebars.registerHelper "isCurrentUser", (_id) ->
  _id is getInSession("DBID")

Handlebars.registerHelper "isCurrentUserMuted", ->
  return currentUserIsMuted()

Handlebars.registerHelper "isCurrentUserRaisingHand", ->
  user = Meteor.Users.findOne({_id:getInSession("DBID")})
  user?.user?.raise_hand

Handlebars.registerHelper "isCurrentUserSharingAudio", ->
  user = Meteor.Users.findOne({_id: getInSession("DBID")})
  return user?.user?.voiceUser?.joined

Handlebars.registerHelper "isCurrentUserSharingVideo", ->
  user = Meteor.Users.findOne({_id:getInSession("DBID")})
  user?.webcam_stream?.length isnt 0

Handlebars.registerHelper "isCurrentUserTalking", ->
  user = Meteor.Users.findOne({_id:getInSession("DBID")})
  return user?.user?.voiceUser?.talking

Handlebars.registerHelper "isDisconnected", ->
  return !Meteor.status().connected

Handlebars.registerHelper "isUserListenOnly", (_id) ->
  user = Meteor.Users.findOne({_id:_id})
  return user?.user?.listenOnly

Handlebars.registerHelper "isUserMuted", (_id) ->
  user = Meteor.Users.findOne({_id:_id})
  return user?.user?.voiceUser?.muted

Handlebars.registerHelper "isUserSharingAudio", (_id) ->
  user = Meteor.Users.findOne({_id:_id})
  return user.user?.voiceUser?.joined

Handlebars.registerHelper "isUserSharingVideo", (_id) ->
  user = Meteor.Users.findOne({_id:_id})
  return user.user?.webcam_stream?.length isnt 0

Handlebars.registerHelper "isUserTalking", (_id) ->
  user = Meteor.Users.findOne({_id:_id})
  return user?.user?.voiceUser?.talking

Handlebars.registerHelper "meetingIsRecording", ->
  Meteor.Meetings.findOne()?.recorded # Should only ever have one meeting, so we dont need any filter and can trust result #1

Handlebars.registerHelper "messageFontSize", ->
  style: "font-size: #{getInSession("messageFontSize")}px;"

Handlebars.registerHelper "pointerLocation", ->
  currentPresentation = Meteor.Presentations.findOne({"presentation.current": true})
  presentationId = currentPresentation?.presentation?.id
  currentSlideDoc = Meteor.Slides.findOne({"presentationId": presentationId, "slide.current": true})
  pointer = currentPresentation?.pointer
  pointer.x = (- currentSlideDoc.slide.x_offset * 2 + currentSlideDoc.slide.width_ratio * pointer.x) / 100
  pointer.y = (- currentSlideDoc.slide.y_offset * 2 + currentSlideDoc.slide.height_ratio * pointer.y) / 100
  pointer

Handlebars.registerHelper "safeName", (str) ->
  safeString(str)

Handlebars.registerHelper "setInSession", (k, v) -> SessionAmplify.set k, v

Handlebars.registerHelper "visibility", (section) ->
  if getInSession "display_#{section}"
    style: 'display:block'
  else
    style: 'display:none'

@isSharingAudio = ->
  return Meteor.Users.findOne({_id: getInSession "DBID"})?.user?.voiceUser?.joined

# transform plain text links into HTML tags compatible with Flash client
@linkify = (str) ->
  www = /(^|[^\/])(www\.[\S]+($|\b))/img
  http = /\b(https?:\/\/[0-9a-z+|.,:;\/&?_~%#=@!-]*[0-9a-z+|\/&_~%#=@-])/img
  str = str.replace http, "<a href='event:$1'><u>$1</u></a>"
  str = str.replace www, "$1<a href='event:http://$2'><u>$2</u></a>"

@setInSession = (k, v) ->
  if k is "DBID" then  console.log "setInSession #{k}, #{v}"
  SessionAmplify.set k, v

@sendMeetingInfoToClient = (meetingId, userId) ->
    setInSession("userId", userId)
    setInSession("meetingId", meetingId)
    setInSession("currentChatId", meetingId) #TODO check if this is needed
    setInSession("meetingName", null)
    setInSession("userName", null)

# check the chat history of the user and add tabs for the private chats
@populateChatTabs = (msg) ->
  mydbid = getInSession "DBID"
  users = Meteor.Users.find().fetch()

  # assuming that I only have access only to private messages where I am the sender or the recipient
  myPrivateChats = Meteor.Chat.find({'message.chat_type': 'PRIVATE_CHAT'}).fetch()

  uniqueArray = []
  for chat in myPrivateChats
    if chat.message.to_userid is mydbid
      uniqueArray.push({userId: chat.message.from_userid, username: chat.message.from_username})
    if chat.message.from_userid is mydbid
      uniqueArray.push({userId: chat.message.to_userid, username: chat.message.to_username})

  #keep unique entries only
  uniqueArray = uniqueArray.filter((itm, i, a) ->
      i is a.indexOf(itm)
    )
  #insert the unique entries in the collection
  for u in uniqueArray
    tabs = getInSession('chatTabs')
    unless tabs.filter((tab) -> tab.userId == u.userId).length isnt 0
      tabs.push {userId: u.userId, name: u.username, gotMail: false, class: 'privateChatTab'}
      setInSession 'chatTabs', tabs

@setInSession = (k, v) -> SessionAmplify.set k, v 

@safeString = (str) ->
  if typeof str is 'string' and 1 is 1
    str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

@toggleCam = (event) ->
  # Meteor.Users.update {_id: context._id} , {$set:{"user.sharingVideo": !context.sharingVideo}}
  # Meteor.call('userToggleCam', context._id, !context.sharingVideo)

@toggleChatbar = ->
  setInSession "display_chatbar", !getInSession "display_chatbar"

@toggleMic = (event) ->
  u = Meteor.Users.findOne({_id:getInSession("DBID")})
  if u?
    Meteor.call('publishMuteRequest', getInSession("meetingId"),u._id, getInSession("userId"), u._id, not u.user.voiceUser.muted)

@toggleNavbar = ->
  setInSession "display_navbar", !getInSession "display_navbar"

# toggle state of session variable
@toggleUsersList = ->
  setInSession "display_usersList", !getInSession "display_usersList"

@toggleVoiceCall = (event) ->
	if isSharingAudio()
		# hangup and inform bbb-apps
		Meteor.call("userStopAudio", getInSession("meetingId"), getInSession("userId"), getInSession("DBID"), getInSession("userId"), getInSession("DBID"))
		hangupCallback = ->
			console.log "left voice conference"
		webrtc_hangup hangupCallback # sign out of call
	else
		# create voice call params
		username = "#{getInSession("userId")}-bbbID-#{getUsersName()}"
		voiceBridge = Meteor.Meetings.findOne({}).voiceConf
		server = null
		joinCallback = (message) ->
			console.log "started webrtc_call"
		webrtc_call(username, voiceBridge, server, joinCallback) # make the call
	return false

@toggleWhiteBoard = ->
  setInSession "display_whiteboard", !getInSession "display_whiteboard"

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

# applies zooming to the stroke thickness
@zoomStroke = (thickness) ->
  currentSlide = @getCurrentSlideDoc()
  ratio = (currentSlide?.slide.width_ratio + currentSlide?.slide.height_ratio) / 2
  thickness * 100 / ratio
