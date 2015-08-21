###
This file contains the BigBlueButton client APIs that will allow 3rd-party applications
to embed the HTML5 client and interact with it through Javascript.

HOW TO USE:
Some APIs allow synchronous and asynchronous calls. When using asynchronous, the 3rd-party
JS should register as listener for events listed at the bottom of this file. For synchronous,
3rd-party JS should pass in a callback function when calling the API.

For an example on how to use these APIs, see:

https://github.com/bigbluebutton/bigbluebutton/blob/master/bigbluebutton-client/resources/prod/lib/3rd-party.js
https://github.com/bigbluebutton/bigbluebutton/blob/master/bigbluebutton-client/resources/prod/3rd-party.html
###

@BBB = (->

  BBB = {}

  returnOrCallback = (res, callback) ->
    if callback? and typeof callback is "function"
      callback res
    else
      res

  BBB.isPollGoing = (userId) ->
    if userId isnt undefined and Meteor.Polls.findOne({"poll_info.users": userId})
      return true
    else
      return false

  BBB.getCurrentPoll = (userId) ->
    if userId isnt undefined and Meteor.Polls.findOne({"poll_info.users": userId})
      return Meteor.Polls.findOne({"poll_info.users": userId})

  BBB.sendPollResponseMessage = (key, pollAnswerId) ->
    Meteor.call "publishVoteMessage", BBB.getMeetingId(), pollAnswerId, getInSession("userId"), getInSession("authToken")

  BBB.getMeetingId = ->
    Meteor.Meetings.findOne()?.meetingId

  BBB.getInternalMeetingId = (callback) ->

  ###
    Queryies the user object via it's id
  ###
  BBB.getUser = (userId) ->
    Meteor.Users.findOne({userId: userId})

  BBB.getCurrentUser = () ->
    BBB.getUser(getInSession("userId"))

  ###
  Query if the current user is sharing webcam.

  Param:
  callback - function to return the result

  If you want to instead receive an event with the result, register a listener
  for AM_I_SHARING_CAM_RESP (see below).
  ###
  BBB.amISharingWebcam = (callback) ->
    # BBB.isUserSharingWebcam BBB.getCurrentUser()?.userId
    return false

  ###

  Query if another user is sharing her camera.

  Param:
  userID : the id of the user that may be sharing the camera
  callback: function if you want to be informed synchronously. Don't pass a function
  if you want to be informed through an event. You have to register for
  IS_USER_PUBLISHING_CAM_RESP (see below).
  ###
  BBB.isUserSharingWebcam = (userId, callback) ->
    # BBB.getUser(userId)?.user?.webcam_stream?.length isnt 0
    return false


  # returns whether the user has joined any type of audio
  BBB.amIInAudio = (callback) ->
    user = BBB.getCurrentUser()
    user?.user?.listenOnly or user?.user?.voiceUser?.joined

  # returns true if the user has joined the listen only audio stream
  BBB.amIListenOnlyAudio = (callback) ->
    BBB.getCurrentUser()?.user?.listenOnly

  # returns whether the user has joined the voice conference and is sharing audio through a microphone
  BBB.amISharingAudio = (callback) ->
    BBB.isUserSharingAudio BBB.getCurrentUser()?.userId

  # returns whether the user is currently talking
  BBB.amITalking = (callback) ->
    BBB.isUserTalking BBB.getCurrentUser()?.userId

  BBB.isUserInAudio = (userId, callback) ->
    user = BBB.getUser(userId)
    user?.user?.listenOnly or user?.user?.voiceUser?.joined

  BBB.isUserListenOnlyAudio = (userId, callback) ->
    BBB.getUser(userId)?.user?.listenOnly

  BBB.isUserSharingAudio = (userId, callback) ->
    BBB.getUser(userId)?.user?.voiceUser?.joined

  BBB.isUserTalking = (userId, callback) ->
    BBB.getUser(userId)?.user?.voiceUser?.talking

  BBB.isUserPresenter = (userId, callback) ->
    BBB.getUser(userId)?.user?.presenter

  # returns true if the current user is marked as locked
  BBB.amILocked = ->
    return BBB.getCurrentUser()?.user.locked

  # check whether the user is locked AND the current lock settings for the room
  # includes locking the microphone of viewers (listenOnly is still alowed)
  BBB.isMyMicLocked = ->
    lockedMicForRoom = Meteor.Meetings.findOne()?.roomLockSettings.disableMic
    # note that voiceUser.locked is not used in BigBlueButton at this stage (April 2015)

    return lockedMicForRoom and BBB.amILocked()

  BBB.getCurrentSlide = ->
    currentPresentation = Meteor.Presentations.findOne({"presentation.current": true})
    presentationId = currentPresentation?.presentation?.id
    currentSlide = Meteor.Slides.findOne({"presentationId": presentationId, "slide.current": true})

  BBB.getMeetingName = ->
    Meteor.Meetings.findOne()?.meetingName or null

  BBB.getNumberOfUsers = ->
    Meteor.Users.find().count()

  BBB.currentPresentationName = ->
    Meteor.Presentations.findOne({"presentation.current": true})?.presentation?.name

  ###
  Raise user's hand.
  Param:

  ###
  BBB.lowerHand = (meetingId, toUserId, byUserId, byAuthToken) ->
    Meteor.call('userLowerHand', meetingId, toUserId, byUserId, byAuthToken)

  BBB.raiseHand = (meetingId, toUserId, byUserId, byAuthToken) ->
    Meteor.call('userRaiseHand', meetingId, toUserId, byUserId, byAuthToken)

  BBB.isUserRaisingHand = (userId) ->
    BBB.getUser(userId)?.user?.raise_hand

  BBB.isCurrentUserRaisingHand = ->
    BBB.isUserRaisingHand(BBB.getCurrentUser()?.userId)

  BBB.isMeetingRecording = ->
    MEteor.Meetings.findOne()?.recorded


  ###
  Issue a switch presenter command.

  Param:
  newPresenterUserID - the user id of the new presenter

  3rd-party JS must listen for SWITCHED_PRESENTER (see below) to get notified
  of switch presenter events.
  ###
  BBB.switchPresenter = (newPresenterUserID) ->

  ###
  Query if current user is presenter.

  Params:
  callback - function if you want a callback as response. Otherwise, you need to listen
  for AM_I_PRESENTER_RESP (see below).
  ###
  BBB.amIPresenter = (callback) ->
    returnOrCallback false, callback

  ###
  Eject a user.

  Params:
  userID - userID of the user you want to eject.
  ###
  BBB.ejectUser = (userID) ->

  ###
  Query who is presenter.

  Params:
  callback - function that gets executed for the response.
  ###
  BBB.getPresenterUserID = (callback) ->

  ###
  Query the current user's role.
  Params:
  callback - function if you want a callback as response. Otherwise, you need to listen
  for GET_MY_ROLE_RESP (see below).
  ###
  BBB.getMyRole = (callback) ->
    returnOrCallback "VIEWER", callback

  ###
  Query the current user's id.

  Params:
  callback - function that gets executed for the response.
  ###
  BBB.getMyUserID = (callback) ->
    returnOrCallback getInSession("userId"), callback


  BBB.getMyDBID = (callback) ->
    returnOrCallback Meteor.Users.findOne({userId:getInSession("userId")})?._id, callback


  BBB.getMyUserName = (callback) ->
    name = getInSession "userName" # check if we actually have one in the session

    if name?
      name # great return it, no database query
    else # we need it from the database
      user = BBB.getCurrentUser()

      if user?
        name = BBB.getUserName(user.userId)
        setInSession "userName", name # store in session for fast access next time
        name

  BBB.getMyVoiceBridge = (callback) ->
    res = Meteor.Meetings.findOne({}).voiceConf
    returnOrCallback res, callback

  BBB.getUserName = (userId, callback) ->
    returnOrCallback BBB.getUser(userId)?.user?.name, callback

  ###
  Query the current user's role.
  Params:
  callback - function if you want a callback as response. Otherwise, you need to listen
  for GET_MY_ROLE_RESP (see below).
  ###
  BBB.getMyUserInfo = (callback) ->
    result =
      myUserID: BBB.getMyUserID()
      myUsername: BBB.getMyUserName()
      myAvatarURL: null
      myRole: BBB.getMyRole()
      amIPresenter: BBB.amIPresenter()
      voiceBridge: BBB.getMyVoiceBridge()
      dialNumber: null

    returnOrCallback(result, callback)

  ###
  Query the meeting id.

  Params:
  callback - function that gets executed for the response.
  ###


  ###
  Join the voice conference.
  isListenOnly: signifies whether the user joining the conference audio requests to join the listen only stream
  ###
  BBB.joinVoiceConference = (callback, isListenOnly) ->
    if BBB.isMyMicLocked()
      callIntoConference(BBB.getMyVoiceBridge(), callback, true) #true because we force isListenOnly mode
    callIntoConference(BBB.getMyVoiceBridge(), callback, isListenOnly)

  ###
  Leave the voice conference.
  ###
  BBB.leaveVoiceConference = (callback) ->
    webrtc_hangup callback # sign out of call

  ###
  Get a hold of the object containing the call information
  ###
  BBB.getCallStatus = ->
    getCallStatus()

  ###
  Share user's webcam.

  Params:
  publishInClient : (DO NOT USE - Unimplemented)
  ###
  BBB.shareVideoCamera = (publishInClient) ->

  ###
  Stop share user's webcam.
  ###
  BBB.stopSharingCamera = ->

  ###
    Indicates if a user is muted
  ###
  BBB.isUserMuted = (id) ->
    BBB.getUser(id)?.user?.voiceUser?.muted

  ###
    Indicates if the current user is muted
  ###
  BBB.amIMuted = ->
    BBB.isUserMuted(BBB.getCurrentUser().userId)

  ###
  Mute the current user.
  ###
  BBB.muteMe = ->
    BBB.muteUser(getInSession("userId"), getInSession("userId"), getInSession("authToken"))
  ###
  Unmute the current user.
  ###
  BBB.unmuteMe = ->
    BBB.unmuteUser(getInSession("userId"), getInSession("userId"), getInSession("authToken"))

  BBB.muteUser = (meetingId, userId, toMuteId, requesterId, requestToken) ->
    Meteor.call('muteUser', meetingId, toMuteId, requesterId, getInSession("authToken"))

  BBB.unmuteUser = (meetingId, userId, toMuteId, requesterId, requestToken) ->
    Meteor.call('unmuteUser', meetingId, toMuteId, requesterId, getInSession("authToken"))

  BBB.toggleMyMic = ->
    request = if BBB.amIMuted() then "unmuteUser" else "muteUser"
    Meteor.call(request, BBB.getMeetingId(), getInSession("userId"), getInSession("userId"), getInSession("authToken"))

  ###
  Mute all the users.
  ###
  BBB.muteAll = ->

  ###
  Unmute all the users.
  ###
  BBB.unmuteAll = ->

  ###
  Switch to a new layout.

  Param:
  newLayout : name of the layout as defined in layout.xml (found in /var/www/bigbluebutton/client/conf/layout.xml)
  ###
  BBB.switchLayout = (newLayout) ->

  ###
  Lock the layout.

  Locking the layout means that users will have the same layout with the moderator that issued the lock command.
  Other users won't be able to move or resize the different windows.
  ###
  BBB.lockLayout = (lock) ->

  ###
  Request to send a public chat
  fromUserID - the external user id for the sender
  fontColor  - the color of the font to display the message
  localeLang - the 2-char locale code (e.g. en) for the sender
  message    - the message to send
  ###
  BBB.sendPublicChatMessage = (fontColor, localeLang, message) ->
    messageForServer = { # construct message for server
      "message": message
      "chat_type": "PUBLIC_CHAT"
      "from_userid": getInSession("userId")
      "from_username": BBB.getMyUserName()
      "from_tz_offset": "240"
      "to_username": "public_chat_username"
      "to_userid": "public_chat_userid"
      "from_lang": localeLang
      "from_time": getTime()
      "from_color": fontColor
    }

    Meteor.call "sendChatMessagetoServer", BBB.getMeetingId(), messageForServer, getInSession("userId"), getInSession("authToken")

  ###
  Request to send a private chat
  fromUserID - the external user id for the sender
  fontColor  - the color of the font to display the message
  localeLang - the 2-char locale code (e.g. en) for the sender
  message    - the message to send
  toUserID   - the external user id of the receiver
  ###
  BBB.sendPrivateChatMessage = (fontColor, localeLang, message, toUserID, toUserName) ->
    messageForServer = { # construct message for server
      "message": message
      "chat_type": "PRIVATE_CHAT"
      "from_userid": getInSession("userId")
      "from_username": BBB.getMyUserName()
      "from_tz_offset": "240"
      "to_username": toUserName
      "to_userid": toUserID
      "from_lang": localeLang
      "from_time": getTime()
      "from_color": fontColor
    }

    Meteor.call "sendChatMessagetoServer", BBB.getMeetingId(), messageForServer, getInSession("userId"), getInSession("authToken")

  ###
  Request to display a presentation.
  presentationID - the presentation to display
  ###
  BBB.displayPresentation = (presentationID) ->

  ###
  Query the list of uploaded presentations.
  ###
  BBB.queryListOfPresentations = ->

  ###
  Request to delete a presentation.
  presentationID - the presentation to delete
  ###
  BBB.deletePresentation = (presentationID) ->

  # Request to switch the presentation to the previous slide
  BBB.goToPreviousPage = () ->
    Meteor.call('publishSwitchToPreviousSlideMessage',
      getInSession('meetingId'),
      getInSession('userId'),
      getInSession('authToken'))

  # Request to switch the presentation to the next slide
  BBB.goToNextPage = () ->
    Meteor.call('publishSwitchToNextSlideMessage',
      getInSession('meetingId'),
      getInSession('userId'),
      getInSession('authToken'))

  BBB.webRTCConferenceCallStarted = ->

  BBB.webRTCConferenceCallConnecting = ->

  BBB.webRTCConferenceCallEnded = ->

  BBB.webRTCConferenceCallFailed = (errorcode) ->

  BBB.webRTCConferenceCallWaitingForICE = ->

  BBB.webRTCCallProgressCallback = (progress) ->

  BBB.webRTCEchoTestStarted = ->

  BBB.webRTCEchoTestConnecting = ->

  BBB.webRTCEchoTestFailed = (reason) ->

  BBB.webRTCEchoTestWaitingForICE = ->

  BBB.webRTCEchoTestEnded = ->

  BBB.webRTCMediaRequest = ->

  BBB.webRTCMediaSuccess = ->

  BBB.webRTCMediaFail = ->

  BBB.webRTCWebcamRequest = ->

  BBB.webRTCWebcamRequestSuccess = ->

  BBB.webRTCWebcamRequestFail = (reason) ->

  # Third-party JS apps should use this to query if the BBB SWF file is ready to handle calls.

  # ***********************************************************************************
  # *       Broadcasting of events to 3rd-party apps.
  # ************************************************************************************

  ###
  Stores the 3rd-party app event listeners **
  ###
  listeners = {}

  ###
  3rd-party apps should use this method to register to listen for events.
  ###
  BBB.listen = (eventName, handler) ->

  ###
  3rd-party app should use this method to unregister listener for a given event.
  ###
  BBB.unlisten = (eventName, handler) ->

  BBB.init = (callback) ->

  BBB
)()
