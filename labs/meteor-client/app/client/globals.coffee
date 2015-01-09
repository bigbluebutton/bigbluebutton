@getBuildInformation = ->
  appName = Meteor.config?.appName or "UNKNOWN NAME"
  copyrightYear = Meteor.config?.copyrightYear or "UNKNOWN DATE"
  dateOfBuild = Meteor.config?.dateOfBuild or "UNKNOWN DATE"
  defaultWelcomeMessage = Meteor.config?.defaultWelcomeMessage or "UNKNOWN"
  defaultWelcomeMessageFooter = Meteor.config?.defaultWelcomeMessageFooter or "UNKNOWN"
  link = "<a href='http://bigbluebutton.org/' target='_blank'>http://bigbluebutton.org</a>"
  bbbServerVersion = Meteor.config?.bbbServerVersion or "UNKNOWN VERSION"

  {
    'appName': appName
    'copyrightYear': copyrightYear
    'dateOfBuild': dateOfBuild
    'defaultWelcomeMessage': defaultWelcomeMessage
    'defaultWelcomeMessageFooter': defaultWelcomeMessageFooter
    'link': link
    'bbbServerVersion': bbbServerVersion
  }

# Convert a color `value` as integer to a hex color (e.g. 255 to #0000ff)
@colourToHex = (value) ->
	hex = parseInt(value).toString(16)
	hex = "0" + hex while hex.length < 6
	"##{hex}"

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
  Meteor.Users.findOne(userId: getInSession("userId"))

@getInSession = (k) -> SessionAmplify.get k

@getMeetingName = ->
  return Meteor.Meetings.findOne()?.meetingName or "your meeting"

@getTime = -> # returns epoch in ms
  (new Date).valueOf()

@getTimeOfJoining = ->
  Meteor.Users.findOne(userId: getInSession "userId")?.user?.time_of_joining

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
  return Meteor.Meetings.findOne()?.meetingName or "BigBlueButton"

Handlebars.registerHelper "getShapesForSlide", ->
  currentSlide = getCurrentSlideDoc()

  # try to reuse the lines above
  Meteor.Shapes.find({whiteboardId: currentSlide?.slide?.id})

# retrieves all users in the meeting
Handlebars.registerHelper "getUsersInMeeting", ->
  # Users with raised hand last go first, then sorted by name
  Meteor.Users.find({}, {sort: {'user.raise_hand': -1, 'user._sort_name': 1} })

Handlebars.registerHelper "getWhiteboardTitle", ->
  "Whiteboard: " + (getPresentationFilename() or "Loading...")

Handlebars.registerHelper "isCurrentUser", (userId) ->
  userId is BBB.getCurrentUser()?.userId

Handlebars.registerHelper "isCurrentUserMuted", ->
  BBB.amIMuted()

Handlebars.registerHelper "isCurrentUserRaisingHand", ->
  user = BBB.getCurrentUser()
  user?.user?.raise_hand

Handlebars.registerHelper "isCurrentUserSharingAudio", ->
  BBB.amISharingAudio()

Handlebars.registerHelper "isCurrentUserSharingVideo", ->
  BBB.amISharingVideo()

Handlebars.registerHelper "isCurrentUserTalking", ->
  BBB.amITalking()

Handlebars.registerHelper "isDisconnected", ->
  return !Meteor.status().connected

Handlebars.registerHelper "isUserListenOnly", (userId) ->
  user = Meteor.Users.findOne({userId:userId})
  return user?.user?.listenOnly

Handlebars.registerHelper "isUserMuted", (userId) ->
  BBB.isUserMuted(userId)

Handlebars.registerHelper "isUserSharingAudio", (userId) ->
  BBB.isUserSharingAudio(userId)

Handlebars.registerHelper "isUserSharingVideo", (userId) ->
  BBB.isUserSharingWebcam(userId)

Handlebars.registerHelper "isUserTalking", (userId) ->
  BBB.isUserTalking(userId)

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

Handlebars.registerHelper "visibility", (section) ->
  if getInSession "display_#{section}"
    style: 'display:block;'
  else
    style: 'display:none;'

# transform plain text links into HTML tags compatible with Flash client
@linkify = (str) ->
  www = /(^|[^\/])(www\.[\S]+($|\b))/img
  http = /\b(https?:\/\/[0-9a-z+|.,:;\/&?_~%#=@!-]*[0-9a-z+|\/&_~%#=@-])/img
  str = str.replace http, "<a href='event:$1'><u>$1</u></a>"
  str = str.replace www, "$1<a href='event:http://$2'><u>$2</u></a>"

# check the chat history of the user and add tabs for the private chats
@populateChatTabs = (msg) ->
  myUserId = getInSession "userId"
  users = Meteor.Users.find().fetch()

  # assuming that I only have access only to private messages where I am the sender or the recipient
  myPrivateChats = Meteor.Chat.find({'message.chat_type': 'PRIVATE_CHAT'}).fetch()

  uniqueArray = []
  for chat in myPrivateChats
    if chat.message.to_userid is myUserId
      uniqueArray.push({userId: chat.message.from_userid, username: chat.message.from_username})
    if chat.message.from_userid is myUserId
      uniqueArray.push({userId: chat.message.to_userid, username: chat.message.to_username})

  #keep unique entries only
  uniqueArray = uniqueArray.filter((itm, i, a) ->
      i is a.indexOf(itm)
    )

  if msg.message.to_userid is myUserId
    new_msg_userid = msg.message.from_userid
  if msg.message.from_userid is myUserId
    new_msg_userid = msg.message.to_userid

  #insert the unique entries in the collection
  for u in uniqueArray
    tabs = getInSession('chatTabs')
    if tabs.filter((tab) -> tab.userId == u.userId).length is 0 and u.userId is new_msg_userid
      tabs.push {userId: u.userId, name: u.username, gotMail: false, class: 'privateChatTab'}
      setInSession 'chatTabs', tabs

@setInSession = (k, v) -> SessionAmplify.set k, v

@safeString = (str) ->
  if typeof str is 'string'
    str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

@toggleCam = (event) ->
  # Meteor.Users.update {_id: context._id} , {$set:{"user.sharingVideo": !context.sharingVideo}}
  # Meteor.call('userToggleCam', context._id, !context.sharingVideo)

@toggleChatbar = ->
  setInSession "display_chatbar", !getInSession "display_chatbar"
  setTimeout(redrawWhiteboard, 0)

@toggleMic = (event) ->
  u = Meteor.Users.findOne({userId:getInSession("userId")})
  if u?
    Meteor.call('muteUser', getInSession("meetingId"), u.userId, getInSession("userId"), getInSession("authToken"), not u.user.voiceUser.muted)

@toggleNavbar = ->
  setInSession "display_navbar", !getInSession "display_navbar"

# toggle state of session variable
@toggleUsersList = ->
  setInSession "display_usersList", !getInSession "display_usersList"
  setTimeout(redrawWhiteboard, 0)

@toggleVoiceCall = (event) ->
  if BBB.amISharingAudio()
    hangupCallback = ->
      console.log "left voice conference"
    BBB.leaveVoiceConference hangupCallback #TODO should we apply role permissions to this action?
  else
    # create voice call params
    joinCallback = (message) ->
      console.log "started webrtc_call"
    BBB.joinVoiceConference joinCallback # make the call #TODO should we apply role permissions to this action?
  return false

@toggleWhiteBoard = ->
  setInSession "display_whiteboard", !getInSession "display_whiteboard"
  setTimeout(redrawWhiteboard, 0)

@toggleSlidingMenu = ->
  if $('#sliding-menu').hasClass('sliding-menu-opened')
    setInSession 'display_slidingMenu', false
    $('#sliding-menu').removeClass('sliding-menu-opened')
    $('#darkened-screen').css('display', 'none')
    $(document).unbind('scroll')
  else
    setInSession 'display_slidingMenu', true
    $('#sliding-menu').addClass('sliding-menu-opened')
    $('#darkened-screen').css('display', 'block')
    $(document).bind 'scroll', () ->
      window.scrollTo(0, 0)

# Starts the entire logout procedure.
# meeting: the meeting the user is in
# the user's userId
@userLogout = (meeting, user) ->
  Meteor.call("userLogout", meeting, user, getInSession("authToken"))
  console.log "logging out #{Meteor.config.app.logOutUrl}"
  document.location = Meteor.config.app.logOutUrl # navigate to logout

# Clear the local user session
@clearSessionVar = (callback) ->
  delete SessionAmplify.keys['authToken']
  delete SessionAmplify.keys['bbbServerVersion']
  delete SessionAmplify.keys['chatTabs']
  delete SessionAmplify.keys['dateOfBuild']
  delete SessionAmplify.keys['display_chatPane']
  delete SessionAmplify.keys['display_chatbar']
  delete SessionAmplify.keys['display_navbar']
  delete SessionAmplify.keys['display_usersList']
  delete SessionAmplify.keys['display_whiteboard']
  delete SessionAmplify.keys['inChatWith']
  delete SessionAmplify.keys['meetingId']
  delete SessionAmplify.keys['messageFontSize']
  delete SessionAmplify.keys['tabsRenderedTime']
  delete SessionAmplify.keys['userId']
  delete SessionAmplify.keys['userName']
  callback()

# assign the default values for the Session vars
@setDefaultSettings = ->
  console.log "in setDefaultSettings"
  setInSession "display_usersList", true
  setInSession "display_navbar", true
  setInSession "display_chatbar", true
  setInSession "display_whiteboard", true
  setInSession "display_chatPane", true
  setInSession "inChatWith", 'PUBLIC_CHAT'
  setInSession "messageFontSize", 12
  setInSession 'display_slidingMenu', false


@onLoadComplete = ->
  setDefaultSettings()

  Meteor.Users.find().observe({
  removed: (oldDocument) ->
    if oldDocument.userId is getInSession 'userId'
      document.location = Meteor.config.app.logOutUrl
  })

# applies zooming to the stroke thickness
@zoomStroke = (thickness) ->
  currentSlide = @getCurrentSlideDoc()
  ratio = (currentSlide?.slide.width_ratio + currentSlide?.slide.height_ratio) / 2
  thickness * 100 / ratio

# TODO TEMPORARY!!
# must not have this in production
@whoami = ->
  console.log JSON.stringify
    username: getInSession "userName"
    userid: getInSession "userId"
    authToken: getInSession "authToken"

@listSessionVars = ->
  console.log SessionAmplify.keys
