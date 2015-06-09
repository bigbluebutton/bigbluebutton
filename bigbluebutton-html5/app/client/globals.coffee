@getBuildInformation = ->
  copyrightYear = Meteor.config?.copyrightYear or "DATE"
  html5ClientBuild = Meteor.config?.html5ClientBuild or "VERSION"
  defaultWelcomeMessage = Meteor.config?.defaultWelcomeMessage or "WELCOME MESSAGE"
  defaultWelcomeMessageFooter = Meteor.config?.defaultWelcomeMessageFooter or "WELCOME MESSAGE"
  link = "<a href='http://bigbluebutton.org/' target='_blank'>http://bigbluebutton.org</a>"

  {
    'copyrightYear': copyrightYear
    'html5ClientBuild': html5ClientBuild
    'defaultWelcomeMessage': defaultWelcomeMessage
    'defaultWelcomeMessageFooter': defaultWelcomeMessageFooter
    'link': link
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

@getCurrentSlideDoc = -> # returns only one document
  BBB.getCurrentSlide()

@getInSession = (k) -> SessionAmplify.get k

@getTime = -> # returns epoch in ms
  (new Date).valueOf()

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

# Allow access through all templates
Handlebars.registerHelper "getInSession", (k) -> SessionAmplify.get k

Handlebars.registerHelper "getMeetingName", ->
  BBB.getMeetingName()

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
  (BBB.currentPresentationName() or "Loading presentation...")

Handlebars.registerHelper "isCurrentUser", (userId) ->
  userId is null or userId is BBB.getCurrentUser()?.userId

Handlebars.registerHelper "isCurrentUserMuted", ->
  BBB.amIMuted()

#Retreives a username for a private chat tab from the database if it exists
Handlebars.registerHelper "privateChatName", ->
  obj = Meteor.Users.findOne({ userId: getInSession "inChatWith" })
  if obj?
    obj?.user?.name

Handlebars.registerHelper "isCurrentUserRaisingHand", ->
  BBB.isCurrentUserRaisingHand()

Handlebars.registerHelper "isCurrentUserSharingVideo", ->
  BBB.amISharingVideo()

Handlebars.registerHelper "isCurrentUserTalking", ->
  BBB.amITalking()

Handlebars.registerHelper "isCurrentUserPresenter", ->
  BBB.isUserPresenter(getInSession('userId'))

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

Handlebars.registerHelper 'isPortraitMobile', () ->
  isPortraitMobile()

Handlebars.registerHelper 'isMobileChromeOrFirefox', () ->
  isMobile() and ((getBrowserName() is 'Chrome') or (getBrowserName() is 'Firefox'))

Handlebars.registerHelper "meetingIsRecording", ->
  BBB.isMeetingRecording()

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

Handlebars.registerHelper 'containerPosition', (section) ->
  if getInSession 'display_usersList'
    return 'moved-to-right'
  else if getInSession 'display_menu'
    return 'moved-to-left'
  else
    return ''

# vertically shrinks the whiteboard if the slide navigation controllers are present
Handlebars.registerHelper 'whiteboardSize', (section) ->
  if BBB.isUserPresenter(getInSession('userId'))
    return 'presenter-whiteboard'
  else
    return 'viewer-whiteboard'

# transform plain text links into HTML tags compatible with Flash client
@linkify = (str) ->
  www = /(^|[^\/])(www\.[\S]+($|\b))/img
  http = /\b(https?:\/\/[0-9a-z+|.,:;\/&?_~%#=@!-]*[0-9a-z+|\/&_~%#=@-])/img
  str = str.replace http, "<a href='event:$1'><u>$1</u></a>"
  str = str.replace www, "$1<a href='event:http://$2'><u>$2</u></a>"

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
  BBB.toggleMyMic()

# toggle state of session variable
@toggleUsersList = ->
  setInSession "display_usersList", !getInSession "display_usersList"
  setTimeout(redrawWhiteboard, 0)

@toggleMenu = ->
  setInSession 'display_menu', !getInSession 'display_menu'

@removeFullscreenStyles = ->
  $('#whiteboard-paper').removeClass('verticallyCentered')
  $('#chat').removeClass('invisible')
  $('#users').removeClass('invisible')
  $('#navbar').removeClass('invisible')
  $('.fullscreenButton').removeClass('exitFullscreenButton')
  $('.fullscreenButton').addClass('whiteboardFullscreenButton')
  $('.fullscreenButton i').removeClass('ion-arrow-shrink')
  $('.fullscreenButton i').addClass('ion-arrow-expand')

@enterWhiteboardFullscreen = ->
  element = document.getElementById('whiteboard')
  if element.requestFullscreen
    element.requestFullscreen()
  else if element.mozRequestFullScreen
    element.mozRequestFullScreen()
    $('.fullscreenButton').addClass('iconFirefox') # browser-specific icon sizing
  else if element.webkitRequestFullscreen
    element.webkitRequestFullscreen()
    $('.fullscreenButton').addClass('iconChrome') # browser-specific icon sizing
  else if element.msRequestFullscreen
    element.msRequestFullscreen()
  $('#chat').addClass('invisible')
  $('#users').addClass('invisible')
  $('#navbar').addClass('invisible')
  $('.fullscreenButton').removeClass('whiteboardFullscreenButton')
  $('.fullscreenButton').addClass('exitFullscreenButton')
  $('.fullscreenButton i').removeClass('ion-arrow-expand')
  $('.fullscreenButton i').addClass('ion-arrow-shrink')
  $('#whiteboard-paper').addClass('verticallyCentered')
  $('#whiteboard').bind 'webkitfullscreenchange', (e) ->
    if document.webkitFullscreenElement is null
      $('#whiteboard').unbind('webkitfullscreenchange')
      $('.fullscreenButton').removeClass('iconChrome')
      removeFullscreenStyles()
      redrawWhiteboard()
  $(document).bind 'mozfullscreenchange', (e) -> # target is always the document in Firefox
    if document.mozFullScreenElement is null
      $(document).unbind('mozfullscreenchange')
      $('.fullscreenButton').removeClass('iconFirefox')
      removeFullscreenStyles()
      redrawWhiteboard()

@closePushMenus = ->
  setInSession 'display_usersList', false
  setInSession 'display_menu', false

# Periodically check the status of the WebRTC call, when a call has been established attempt to hangup,
# retry if a call is in progress, send the leave voice conference message to BBB
@exitVoiceCall = (event) ->
  # To be called when the hangup is initiated
  hangupCallback = ->
    console.log "Exiting Voice Conference"

  # Checks periodically until a call is established so we can successfully end the call
  # clean state
  getInSession("triedHangup", false)
  # function to initiate call
  (checkToHangupCall = (context) ->
    # if an attempt to hang up the call is made when the current session is not yet finished, the request has no effect
    # keep track in the session if we haven't tried a hangup
    if BBB.getCallStatus() isnt null and !getInSession("triedHangup")
      console.log "Attempting to hangup on WebRTC call"
      if BBB.amIListenOnlyAudio() # notify BBB-apps we are leaving the call call if we are listen only
        Meteor.call('listenOnlyRequestToggle', BBB.getMeetingId(), getInSession("userId"), getInSession("authToken"), false)
      BBB.leaveVoiceConference hangupCallback
      getInSession("triedHangup", true) # we have hung up, prevent retries
      notification_WebRTCAudioExited()
    else
      console.log "RETRYING hangup on WebRTC call in #{Meteor.config.app.WebRTCHangupRetryInterval} ms"
      setTimeout checkToHangupCall, Meteor.config.app.WebRTCHangupRetryInterval # try again periodically
  )(@) # automatically run function
  return false

# close the daudio UI, then join the conference. If listen only send the request to the server
@joinVoiceCall = (event, {isListenOnly} = {}) ->
  if !isWebRTCAvailable()
    notification_WebRTCNotSupported()
    return

  isListenOnly ?= true

  # create voice call params
  joinCallback = (message) ->
    console.log "Beginning WebRTC Conference Call"

  notification_WebRTCAudioJoining()
  if isListenOnly
    Meteor.call('listenOnlyRequestToggle', BBB.getMeetingId(), getInSession("userId"), getInSession("authToken"), true)
  BBB.joinVoiceConference joinCallback, isListenOnly # make the call #TODO should we apply role permissions to this action?

  return false

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
  amplify.store('display_menu', null)
  if callback?
    callback()

# assign the default values for the Session vars
@setDefaultSettings = ->
  setInSession "display_navbar", true
  setInSession "display_chatbar", true
  setInSession "display_whiteboard", true
  setInSession "display_chatPane", true
  if not getInSession "inChatWith" then setInSession "inChatWith", 'PUBLIC_CHAT'
  if isPortraitMobile() or isLandscapeMobile()
    setInSession "messageFontSize", Meteor.config.app.mobileFont
  else
    setInSession "messageFontSize", Meteor.config.app.desktopFont
  setInSession 'display_slidingMenu', false
  setInSession 'display_hiddenNavbarSection', false
  if isLandscape()
    setInSession 'display_usersList', true
  else
    setInSession 'display_usersList', false
  setInSession 'display_menu', false
  TimeSync.loggingEnabled = false # suppresses the log messages from timesync

@onLoadComplete = ->
  document.title = "BigBlueButton #{BBB.getMeetingName() ? 'HTML5'}"
  setDefaultSettings()

  Meteor.Users.find().observe({
  removed: (oldDocument) ->
    if oldDocument.userId is getInSession 'userId'
      document.location = getInSession 'logoutURL'
  })

# Detects a mobile device
@isMobile = ->
  navigator.userAgent.match(/Android/i) or
  navigator.userAgent.match(/iPhone|iPad|iPod/i) or
  navigator.userAgent.match(/BlackBerry/i) or
  navigator.userAgent.match(/Windows Phone/i) or
  navigator.userAgent.match(/IEMobile/i) or
  navigator.userAgent.match(/BlackBerry/i) or
  navigator.userAgent.match(/webOS/i)

@isLandscape = ->
  window.matchMedia('(orientation: landscape)').matches

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
