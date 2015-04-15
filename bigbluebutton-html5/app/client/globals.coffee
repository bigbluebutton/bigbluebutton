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
  return Meteor.Meetings.findOne()?.meetingName or null

@getTime = -> # returns epoch in ms
  (new Date).valueOf()

@getTimeOfJoining = ->
  Meteor.Users.findOne(userId: getInSession "userId")?.user?.time_of_joining

@getPresentationFilename = ->
  currentPresentation = Meteor.Presentations.findOne({"presentation.current": true})
  currentPresentation?.presentation?.name

# helper to determine whether user has joined any type of audio
Handlebars.registerHelper "amIInAudio", ->
  BBB.amIInAudio()

# helper to determine whether the user is in the listen only audio stream
Handlebars.registerHelper "amIListenOnlyAudio", ->
  BBB.amIListenOnlyAudio()

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
  return Meteor.Meetings.findOne()?.meetingName or null

Handlebars.registerHelper "getShapesForSlide", ->
  currentSlide = getCurrentSlideDoc()

  # try to reuse the lines above
  Meteor.Shapes.find({whiteboardId: currentSlide?.slide?.id})

# retrieves all users in the meeting
Handlebars.registerHelper "getUsersInMeeting", ->
  # retrieve all users with raised hands
  # raised hand is an object, so we can't simply search for true
  # sort users by who has raised their hand first, place them at the top
  raised = Meteor.Users.find({'user.raise_hand': {$not: {$in: [0, false, null]} }}, {sort: {'user.raise_hand': 1} }).fetch()
  # find all users with a lowered hand
  # when a hand is lowered, it is not always just false, it can be zero, or null
  lowered = Meteor.Users.find({'user.raise_hand': $in: [0, false, null]}, {sort: {'user._sort_name': 1} }).fetch()
  # add the users with lowered hands, to the list of people with raised hands
  raised.concat lowered

Handlebars.registerHelper "getWhiteboardTitle", ->
  "Presentation: " + (getPresentationFilename() or "Loading...")

Handlebars.registerHelper "isCurrentUser", (userId) ->
  userId is null or userId is BBB.getCurrentUser()?.userId

Handlebars.registerHelper "isCurrentUserMuted", ->
  BBB.amIMuted()

Handlebars.registerHelper "isCurrentUserRaisingHand", ->
  user = BBB.getCurrentUser()
  user?.user?.raise_hand

Handlebars.registerHelper "isCurrentUserSharingVideo", ->
  BBB.amISharingVideo()

Handlebars.registerHelper "isCurrentUserTalking", ->
  BBB.amITalking()

Handlebars.registerHelper "isDisconnected", ->
  return !Meteor.status().connected

Handlebars.registerHelper "isUserInAudio", (userId) ->
  BBB.isUserInAudio(userId)

Handlebars.registerHelper "isUserListenOnlyAudio", (userId) ->
  BBB.isUserListenOnlyAudio(userId)

Handlebars.registerHelper "isUserMuted", (userId) ->
  BBB.isUserMuted(userId)

Handlebars.registerHelper "isUserSharingVideo", (userId) ->
  BBB.isUserSharingWebcam(userId)

Handlebars.registerHelper "isUserTalking", (userId) ->
  BBB.isUserTalking(userId)

Handlebars.registerHelper 'isMobile', () ->
  isMobile()

Handlebars.registerHelper 'isMobile', () ->
  isMobile()

Handlebars.registerHelper 'isMobileChromeOrFirefox', () ->
  isMobile() and ((getBrowserName() is 'Chrome') or (getBrowserName() is 'Firefox'))

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

@introToAudio = (event, {isListenOnly} = {}) ->
  isListenOnly ?= true
  joinVoiceCall event, isListenOnly: isListenOnly
  displayWebRTCNotification()

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
  if getInSession("display_chatbar") and isOnlyOnePanelOpen()
    setInSession "display_usersList", true
    setInSession "display_whiteboard", true
    setInSession "display_chatbar", true
  else
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
  if getInSession("display_usersList") and isOnlyOnePanelOpen()
    setInSession "display_usersList", true
    setInSession "display_whiteboard", true
    setInSession "display_chatbar", true
  else
    setInSession "display_usersList", !getInSession "display_usersList"
  setTimeout(redrawWhiteboard, 0)

# Periodically check the status of the call, when a call has been established attempt to hangup,
# retry if a call is in progress, send the leave voice conference message to BBB
@exitVoiceCall = (event) ->
  hangupCallback = ->
    console.log "Exiting Voice Conference"

  # Checks periodically until a call is established so we can successfully end the call
  # clean state
  getInSession("triedHangup", false)
  # function to initiate call
  (checkToHangupCall = ->
    # if an attempt to hang up the call is made when the current session is not yet finished, the request has no effect
    # keep track in the session
    if currentSession isnt null and !getInSession("triedHangup")
      console.log "Attempting to hangup call"
      if BBB.amIListenOnlyAudio() # notify BBB-apps we are leaving the call call if we are listen only
        Meteor.call('listenOnlyRequestToggle', getInSession("meetingId"), getInSession("userId"), getInSession("authToken"), false)
      BBB.leaveVoiceConference hangupCallback
      getInSession("triedHangup", true) # we have hung up, prevent retries
    else
      console.log "RETRYING"
      setTimeout checkToHangupCall, Meteor.config.app.WebRTCHangupRetryInterval # try again periodically
  )(@)
  return false

# close the daudio UI, then join the conference. If listen only send the request to the server
@joinVoiceCall = (event, {isListenOnly} = {}) ->
  $('#joinAudioDialog').dialog('close')
  isListenOnly ?= true

  # create voice call params
  joinCallback = (message) ->
    console.log "Beginning WebRTC Conference Call"

  if isListenOnly
    Meteor.call('listenOnlyRequestToggle', getInSession("meetingId"), getInSession("userId"), getInSession("authToken"), true)
  BBB.joinVoiceConference joinCallback, isListenOnly # make the call #TODO should we apply role permissions to this action?

  return false

@toggleWhiteBoard = ->
  if getInSession("display_whiteboard") and isOnlyOnePanelOpen()
    setInSession "display_usersList", true
    setInSession "display_whiteboard", true
    setInSession "display_chatbar", true
  else
    setInSession "display_whiteboard", !getInSession "display_whiteboard"
  setTimeout(redrawWhiteboard, 0)

@toggleSlidingMenu = ->
  if $('#sliding-menu').hasClass('sliding-menu-opened')
    DestroyFixedView()
    setInSession 'display_slidingMenu', false
    $('#sliding-menu').removeClass('sliding-menu-opened')
    $('#shield').css('display', 'none')
  else
    CreateFixedView()
    setInSession 'display_slidingMenu', true
    $('#sliding-menu').addClass('sliding-menu-opened')
    $('#shield').css('display', 'block')

@toggleNavbarCollapse = ->
  setInSession 'display_hiddenNavbarSection', !getInSession 'display_hiddenNavbarSection'
  if getInSession 'display_hiddenNavbarSection'
    $('.navbarTitle').addClass('narrowedNavbarTitle');
    $('.collapseNavbarSection').css('display', 'block')
  else
    $('.collapseNavbarSection').css('display', 'none')
    $('.navbarTitle').removeClass('narrowedNavbarTitle');

# Starts the entire logout procedure.
# meeting: the meeting the user is in
# the user's userId
@userLogout = (meeting, user) ->
  Meteor.call("userLogout", meeting, user, getInSession("authToken"))
  console.log "logging out"
  clearSessionVar(document.location = getInSession 'logoutURL') # navigate to logout

# Clear the local user session
@clearSessionVar = (callback) ->
  amplify.store('authToken', null)
  amplify.store('bbbServerVersion', null)
  amplify.store('chatTabs', null)
  amplify.store('dateOfBuild', null)
  amplify.store('display_chatPane', null)
  amplify.store('display_chatbar', null)
  amplify.store('display_navbar', null)
  amplify.store('display_usersList', null)
  amplify.store('display_whiteboard', null)
  amplify.store('inChatWith', null)
  amplify.store('logoutURL', null)
  amplify.store('meetingId', null)
  amplify.store('messageFontSize', null)
  amplify.store('tabsRenderedTime', null)
  amplify.store('userId', null)
  amplify.store('userName', null)
  if callback?
    callback()

# assign the default values for the Session vars
@setDefaultSettings = ->
  # console.log "in setDefaultSettings"
  if isLandscapeMobile()
    setInSession "display_usersList", false
  else
    setInSession "display_usersList", true
  setInSession "display_navbar", true
  setInSession "display_chatbar", true
  setInSession "display_whiteboard", true
  setInSession "display_chatPane", true
  setInSession "inChatWith", 'PUBLIC_CHAT'
  if isPortraitMobile() or isLandscapeMobile()
    setInSession "messageFontSize", Meteor.config.app.mobileFont
  else
    setInSession "messageFontSize", Meteor.config.app.desktopFont
  setInSession 'display_slidingMenu', false
  setInSession 'display_hiddenNavbarSection', false
  setInSession 'webrtc_notification_is_displayed', false

@onLoadComplete = ->
  setDefaultSettings()

  Meteor.Users.find().observe({
  removed: (oldDocument) ->
    if oldDocument.userId is getInSession 'userId'
      document.location = getInSession 'logoutURL'
  })

# applies zooming to the stroke thickness
@zoomStroke = (thickness) ->
  currentSlide = @getCurrentSlideDoc()
  ratio = (currentSlide?.slide.width_ratio + currentSlide?.slide.height_ratio) / 2
  thickness * 100 / ratio

# Detects a mobile device
@isMobile = ->
  navigator.userAgent.match(/Android/i) or
  navigator.userAgent.match(/iPhone|iPad|iPod/i) or
  navigator.userAgent.match(/BlackBerry/i) or
  navigator.userAgent.match(/Windows Phone/i) or
  navigator.userAgent.match(/IEMobile/i) or
  navigator.userAgent.match(/BlackBerry/i) or
  navigator.userAgent.match(/webOS/i)

# Checks if the view is portrait and a mobile device is being used
@isPortraitMobile = () ->
 isMobile() and
 window.matchMedia('(orientation: portrait)').matches and        # browser is portrait
 window.matchMedia('(max-device-aspect-ratio: 1/1)').matches     # device is portrait


# Checks if the view is landscape and mobile device is being used
@isLandscapeMobile = () ->
  isMobile() and
  window.matchMedia('(orientation: landscape)').matches and     # browser is landscape
  window.matchMedia('(min-device-aspect-ratio: 1/1)').matches   # device is landscape


# Checks if only one panel (userlist/whiteboard/chatbar) is currently open
@isOnlyOnePanelOpen = () ->
  #(getInSession "display_usersList" ? 1 : 0) + (getInSession "display_whiteboard" ? 1 : 0) + (getInSession "display_chatbar" ? 1 : 0) is 1
  getInSession("display_usersList") + getInSession("display_whiteboard") + getInSession("display_chatbar") is 1

# Reverts all the changes to userlist, whiteboard and chat made by the push menu
@DestroyFixedView = () ->

  $('#chat').css('position', '')
  $('#chat').css('top', '')
  $('#chat').css('left', '')

  $('#users').css('position', '')
  $('#users').css('top', '')
  $('#users').css('left', '')

  $('#whiteboard').css('position', '')
  $('#whiteboard').css('top', '')
  $('#whiteboard').css('left', '')

  $('#footer').css('position', '')
  $('#footer').css('top', '')
  $('#footer').css('left', '')

  $('#chat').css('height', '')
  $('#users').css('height', '')
  $('#users').css('width', '')
  $('#whiteboard').css('height', '')
  $('#footer').css('height', '')
  $('#footer').css('width', '')

  # pushing the view back
  $('#main').css('position', 'relative')
  $('#main').css('top', '0')
  $('#main').css('left', '0')

# Makes the position of userlist, whiteboard and chat fixed (to disable scrolling) and
# positions each element correctly
@CreateFixedView = () ->

  # positioning the whiteboard

  if getInSession 'display_whiteboard'
    whiteboardHeight = $('#whiteboard').height()
    $('#whiteboard').css('position', 'fixed')
    $('#whiteboard').css('left', '15%')
    $('#whiteboard').css('height', whiteboardHeight + 5 + 'px')
    $('#whiteboard').css('top', '100px')

  # positioning the chatbar

  if getInSession 'display_chatbar'
    chatHeight = $('#chat').height()
    $('#chat').css('position', 'fixed')
    $('#chat').css('left', '15%')
    $('#chat').css('height', chatHeight)
    if getInSession 'display_whiteboard'
      $('#chat').css('top', 110 + $('#whiteboard').height() + 'px')
    else
      $('#chat').css('top', '100px')

  # positioning the userlist

  if getInSession 'display_usersList'
    chatHeight = $('#chat').height()
    usersHeight = $('#users').height()
    usersWidth = $('#users').width()

    $('#users').css('position', 'fixed')
    $('#users').css('left', '15%')
    $('#users').css('width', usersWidth) # prevents from shrinking
    $('#users').css('height', usersHeight)

    top = 100 # minimum margin for the userlist (height of the navbar)
    if getInSession 'display_whiteboard'
      top += $('#whiteboard').height() + 10
    if getInSession 'display_chatbar'
      top += chatHeight + 15
    $('#users').css('top', top + 'px')

  # positioning the footer

  chatHeight = $('#chat').height()
  usersHeight = $('#users').height()
  footerHeight = $('#footer').height()
  footerWidth = $('#footer').width()

  $('#footer').css('position', 'fixed')
  $('#footer').css('left', '15%')
  $('#footer').css('height', footerHeight)
  $('#footer').css('width', footerWidth) # prevents from shrinking

  top = 100
  if getInSession 'display_whiteboard'
    top += $('#whiteboard').height() + 10
  if getInSession 'display_chatbar'
    top += chatHeight + 15
  if getInSession 'display_usersList'
    top += usersHeight + 30
  $('#footer').css('top', top + 'px')

  # pusing the rest of the page right

  $('#main').css('position', 'fixed')
  $('#main').css('top', '50px')
  $('#main').css('left', '15%')

# determines which browser is being used
@getBrowserName = () ->
  if navigator.userAgent.match(/Chrome/i)
    return 'Chrome'
  else if navigator.userAgent.match(/Firefox/i)
    return 'Firefox'
  else if navigator.userAgent.match(/Safari/i)
    return 'Safari'
  else if navigator.userAgent.match(/Trident/i)
    return 'IE'
  else
    return null
