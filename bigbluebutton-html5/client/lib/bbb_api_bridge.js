/*
This file contains the BigBlueButton client APIs that will allow 3rd-party applications
to embed the HTML5 client and interact with it through Javascript.

HOW TO USE:
Some APIs allow synchronous and asynchronous calls. When using asynchronous, the 3rd-party
JS should register as listener for events listed at the bottom of this file. For synchronous,
3rd-party JS should pass in a callback function when calling the API.

For an example on how to use these APIs, see:

https://github.com/bigbluebutton/bigbluebutton/blob/master/bigbluebutton-client/resources/prod/lib/3rd-party.js
https://github.com/bigbluebutton/bigbluebutton/blob/master/bigbluebutton-client/resources/prod/3rd-party.html
 */

this.BBB = (function () {
  let BBB, listeners, returnOrCallback;
  BBB = {};
  returnOrCallback = function (res, callback) {
    if ((callback != null) && typeof callback === 'function') {
      return callback(res);
    } else {
      return res;
    }
  };

  BBB.isPollGoing = function (userId) {
    if (userId !== void 0 && Meteor.Polls.findOne({
      'poll_info.users': userId,
    })) {
      return true;
    } else {
      return false;
    }
  };

  BBB.getCurrentPoll = function (userId) {
    if (userId !== void 0 && Meteor.Polls.findOne({
      'poll_info.users': userId,
    })) {
      return Meteor.Polls.findOne({
        'poll_info.users': userId,
      });
    }
  };

  BBB.sendPollResponseMessage = function (key, pollAnswerId) {
    return Meteor.call('publishVoteMessage', BBB.getMeetingId(), pollAnswerId, getInSession('userId'), getInSession('authToken'));
  };

  BBB.getMeetingId = function () {
    let ref;
    return (ref = Meteor.Meetings.findOne()) != null ? ref.meetingId : void 0;
  };

  BBB.getInternalMeetingId = function (callback) {};

  /*
    Queryies the user object via it's id
   */
  BBB.getUser = function (userId) {
    return Meteor.Users.findOne({
      userId: userId,
    });
  };

  BBB.getCurrentUser = function () {
    return BBB.getUser(getInSession('userId'));
  };

  /*
  Query if the current user is sharing webcam.

  Param:
  callback - function to return the result

  If you want to instead receive an event with the result, register a listener
  for AM_I_SHARING_CAM_RESP (see below).
   */
  BBB.amISharingWebcam = function (callback) {
    // BBB.isUserSharingWebcam BBB.getCurrentUser()?.userId
    return false;
  };

  /*

  Query if another user is sharing her camera.

  Param:
  userID : the id of the user that may be sharing the camera
  callback: function if you want to be informed synchronously. Don't pass a function
  if you want to be informed through an event. You have to register for
  IS_USER_PUBLISHING_CAM_RESP (see below).
   */
  BBB.isUserSharingWebcam = function (userId, callback) {
    // BBB.getUser(userId)?.user?.webcam_stream?.length isnt 0
    return false;
  };

  // returns whether the user has joined any type of audio
  BBB.amIInAudio = function (callback) {
    let ref, ref1, ref2, user;
    user = BBB.getCurrentUser();
    return (user != null ? (ref = user.user) != null ? ref.listenOnly : void 0 : void 0) || (user != null ? (ref1 = user.user) != null ? (ref2 = ref1.voiceUser) != null ? ref2.joined : void 0 : void 0 : void 0);
  };

  // returns true if the user has joined the listen only audio stream
  BBB.amIListenOnlyAudio = function (callback) {
    let ref, ref1;
    return (ref = BBB.getCurrentUser()) != null ? (ref1 = ref.user) != null ? ref1.listenOnly : void 0 : void 0;
  };

  // returns whether the user has joined the voice conference and is sharing audio through a microphone
  BBB.amISharingAudio = function (callback) {
    let ref;
    return BBB.isUserSharingAudio((ref = BBB.getCurrentUser()) != null ? ref.userId : void 0);
  };

  // returns whether the user is currently talking
  BBB.amITalking = function (callback) {
    let ref;
    return BBB.isUserTalking((ref = BBB.getCurrentUser()) != null ? ref.userId : void 0);
  };

  BBB.isUserInAudio = function (userId, callback) {
    let ref, ref1, ref2, user;
    user = BBB.getUser(userId);
    return (user != null ? (ref = user.user) != null ? ref.listenOnly : void 0 : void 0) || (user != null ? (ref1 = user.user) != null ? (ref2 = ref1.voiceUser) != null ? ref2.joined : void 0 : void 0 : void 0);
  };

  BBB.isUserListenOnlyAudio = function (userId, callback) {
    let ref, ref1;
    return (ref = BBB.getUser(userId)) != null ? (ref1 = ref.user) != null ? ref1.listenOnly : void 0 : void 0;
  };

  BBB.isUserSharingAudio = function (userId, callback) {
    let ref, ref1, ref2;
    return (ref = BBB.getUser(userId)) != null ? (ref1 = ref.user) != null ? (ref2 = ref1.voiceUser) != null ? ref2.joined : void 0 : void 0 : void 0;
  };

  BBB.isUserTalking = function (userId, callback) {
    let ref, ref1, ref2;
    return (ref = BBB.getUser(userId)) != null ? (ref1 = ref.user) != null ? (ref2 = ref1.voiceUser) != null ? ref2.talking : void 0 : void 0 : void 0;
  };

  BBB.isUserPresenter = function (userId, callback) {
    let ref, ref1;
    return (ref = BBB.getUser(userId)) != null ? (ref1 = ref.user) != null ? ref1.presenter : void 0 : void 0;
  };

  // returns true if the current user is marked as locked
  BBB.amILocked = function () {
    let ref;
    return (ref = BBB.getCurrentUser()) != null ? ref.user.locked : void 0;
  };

  // check whether the user is locked AND the current lock settings for the room
  // includes locking the microphone of viewers (listenOnly is still alowed)
  BBB.isMyMicLocked = function () {
    let lockedMicForRoom, ref;
    lockedMicForRoom = (ref = Meteor.Meetings.findOne()) != null ? ref.roomLockSettings.disableMic : void 0;

    // note that voiceUser.locked is not used in BigBlueButton at this stage (April 2015)

    return lockedMicForRoom && BBB.amILocked();
  };

  BBB.getCurrentSlide = function () {
    let currentPresentation, currentSlide, presentationId, ref;
    currentPresentation = Meteor.Presentations.findOne({
      'presentation.current': true,
    });
    presentationId = currentPresentation != null ? (ref = currentPresentation.presentation) != null ? ref.id : void 0 : void 0;
    currentSlide = Meteor.Slides.findOne({
      presentationId: presentationId,
      'slide.current': true,
    });
    return currentSlide;
  };

  BBB.getMeetingName = function () {
    let ref;
    return ((ref = Meteor.Meetings.findOne()) != null ? ref.meetingName : void 0) || null;
  };

  BBB.getNumberOfUsers = function () {
    return Meteor.Users.find().count();
  };

  BBB.currentPresentationName = function () {
    let ref, ref1;
    return (ref = Meteor.Presentations.findOne({
      'presentation.current': true,
    })) != null ? (ref1 = ref.presentation) != null ? ref1.name : void 0 : void 0;
  };

  /*
  Raise user's hand.
  Param:
   */
  BBB.lowerHand = function (meetingId, toUserId, byUserId, byAuthToken) {
    return Meteor.call('userLowerHand', meetingId, toUserId, byUserId, byAuthToken);
  };

  BBB.raiseHand = function (meetingId, toUserId, byUserId, byAuthToken) {
    return Meteor.call('userRaiseHand', meetingId, toUserId, byUserId, byAuthToken);
  };

  BBB.setEmojiStatus = function (meetingId, toUserId, byUserId, byAuthToken, status) {
    return Meteor.call('userSetEmoji', meetingId, toUserId, byUserId, byAuthToken, status);
  };

  BBB.isUserEmojiStatusSet = function (userId) {
    let ref, ref1, ref2, ref3;
    return ((ref = BBB.getUser(userId)) != null ? (ref1 = ref.user) != null ? ref1.emoji_status : void 0 : void 0) !== 'none' && ((ref2 = BBB.getUser(userId)) != null ? (ref3 = ref2.user) != null ? ref3.emoji_status : void 0 : void 0) !== void 0;
  };

  BBB.isCurrentUserEmojiStatusSet = function () {
    let ref;
    return BBB.isUserEmojiStatusSet((ref = BBB.getCurrentUser()) != null ? ref.userId : void 0);
  };

  BBB.isMeetingRecording = function () {
    let ref;
    return (ref = MEteor.Meetings.findOne()) != null ? ref.recorded : void 0;
  };

  /*
  Issue a switch presenter command.

  Param:
  newPresenterUserID - the user id of the new presenter

  3rd-party JS must listen for SWITCHED_PRESENTER (see below) to get notified
  of switch presenter events.
   */
  BBB.switchPresenter = function (newPresenterUserID) {};

  /*
  Query if current user is presenter.

  Params:
  callback - function if you want a callback as response. Otherwise, you need to listen
  for AM_I_PRESENTER_RESP (see below).
   */
  BBB.amIPresenter = function (callback) {
    return returnOrCallback(false, callback);
  };

  /*
  Eject a user.

  Params:
  userID - userID of the user you want to eject.
   */
  BBB.ejectUser = function (userID) {};

  /*
  Query who is presenter.

  Params:
  callback - function that gets executed for the response.
   */
  BBB.getPresenterUserID = function (callback) {};

  /*
  Query the current user's role.
  Params:
  callback - function if you want a callback as response. Otherwise, you need to listen
  for GET_MY_ROLE_RESP (see below).
   */
  BBB.getMyRole = function (callback) {
    return returnOrCallback('VIEWER', callback);
  };

  /*
  Query the current user's id.

  Params:
  callback - function that gets executed for the response.
   */
  BBB.getMyUserID = function (callback) {
    return returnOrCallback(getInSession('userId'), callback);
  };

  BBB.getMyDBID = function (callback) {
    let ref;
    return returnOrCallback((ref = Meteor.Users.findOne({
      userId: getInSession('userId'),
    })) != null ? ref._id : void 0, callback);
  };

  BBB.getMyUserName = function (callback) {
    let ref;
    return BBB.getUserName((ref = BBB.getCurrentUser()) != null ? ref.userId : void 0);
  };

  BBB.getMyVoiceBridge = function (callback) {
    let res;
    res = Meteor.Meetings.findOne({}).voiceConf;
    return returnOrCallback(res, callback);
  };

  BBB.getUserName = function (userId, callback) {
    let ref, ref1;
    return returnOrCallback((ref = BBB.getUser(userId)) != null ? (ref1 = ref.user) != null ? ref1.name : void 0 : void 0, callback);
  };

  /*
  Query the current user's role.
  Params:
  callback - function if you want a callback as response. Otherwise, you need to listen
  for GET_MY_ROLE_RESP (see below).
   */
  BBB.getMyUserInfo = function (callback) {
    let result;
    result = {
      myUserID: BBB.getMyUserID(),
      myUsername: BBB.getMyUserName(),
      myInternalUserID: BBB.getMyUserID(),
      myAvatarURL: null,
      myRole: BBB.getMyRole(),
      amIPresenter: BBB.amIPresenter(),
      voiceBridge: BBB.getMyVoiceBridge(),
      dialNumber: null,
    };
    return returnOrCallback(result, callback);
  };

  /*
  Query the meeting id.

  Params:
  callback - function that gets executed for the response.
   */

  /*
  Join the voice conference.
  isListenOnly: signifies whether the user joining the conference audio requests to join the listen only stream
   */
  BBB.joinVoiceConference = function (callback, isListenOnly) {
    if (BBB.isMyMicLocked()) {
      callIntoConference(BBB.getMyVoiceBridge(), callback, true);
    }

    return callIntoConference(BBB.getMyVoiceBridge(), callback, isListenOnly);
  };

  /*
  Leave the voice conference.
   */
  BBB.leaveVoiceConference = function (callback) {
    return webrtc_hangup(callback);
  };

  /*
  Get a hold of the object containing the call information
   */
  BBB.getCallStatus = function () {
    return getCallStatus();
  };

  /*
  Share user's webcam.

  Params:
  publishInClient : (DO NOT USE - Unimplemented)
   */
  BBB.shareVideoCamera = function (publishInClient) {};

  /*
  Stop share user's webcam.
   */
  BBB.stopSharingCamera = function () {};

  /*
    Indicates if a user is muted
   */
  BBB.isUserMuted = function (id) {
    let ref, ref1, ref2;
    return (ref = BBB.getUser(id)) != null ? (ref1 = ref.user) != null ? (ref2 = ref1.voiceUser) != null ? ref2.muted : void 0 : void 0 : void 0;
  };

  /*
    Indicates if the current user is muted
   */
  BBB.amIMuted = function () {
    return BBB.isUserMuted(BBB.getCurrentUser().userId);
  };

  /*
  Mute the current user.
   */
  BBB.muteMe = function () {
    return BBB.muteUser(getInSession('userId'), getInSession('userId'), getInSession('authToken'));
  };

  /*
  Unmute the current user.
   */
  BBB.unmuteMe = function () {
    return BBB.unmuteUser(getInSession('userId'), getInSession('userId'), getInSession('authToken'));
  };

  BBB.muteUser = function (meetingId, userId, toMuteId, requesterId, requestToken) {
    return Meteor.call('muteUser', meetingId, toMuteId, requesterId, getInSession('authToken'));
  };

  BBB.unmuteUser = function (meetingId, userId, toMuteId, requesterId, requestToken) {
    return Meteor.call('unmuteUser', meetingId, toMuteId, requesterId, getInSession('authToken'));
  };

  BBB.toggleMyMic = function () {
    let request;
    request = BBB.amIMuted() ? 'unmuteUser' : 'muteUser';
    return Meteor.call(request, BBB.getMeetingId(), getInSession('userId'), getInSession('userId'), getInSession('authToken'));
  };

  /*
  Mute all the users.
   */
  BBB.muteAll = function () {};

  /*
  Unmute all the users.
   */
  BBB.unmuteAll = function () {};

  /*
  Switch to a new layout.

  Param:
  newLayout : name of the layout as defined in layout.xml (found in /var/www/bigbluebutton/client/conf/layout.xml)
   */
  BBB.switchLayout = function (newLayout) {};

  /*
  Lock the layout.

  Locking the layout means that users will have the same layout with the moderator that issued the lock command.
  Other users won't be able to move or resize the different windows.
   */
  BBB.lockLayout = function (lock) {};

  /*
  Request to send a public chat
  fromUserID - the external user id for the sender
  fontColor  - the color of the font to display the message
  localeLang - the 2-char locale code (e.g. en) for the sender
  message    - the message to send
   */
  BBB.sendPublicChatMessage = function (fontColor, localeLang, message) {
    let messageForServer;
    messageForServer = {
      message: message,
      chat_type: 'PUBLIC_CHAT',
      from_userid: getInSession('userId'),
      from_username: BBB.getMyUserName(),
      from_tz_offset: '240',
      to_username: 'public_chat_username',
      to_userid: 'public_chat_userid',
      from_lang: localeLang,
      from_time: getTime(),
      from_color: fontColor,
    };
    return Meteor.call('sendChatMessagetoServer', BBB.getMeetingId(), messageForServer, getInSession('userId'), getInSession('authToken'));
  };

  /*
  Request to send a private chat
  fromUserID - the external user id for the sender
  fontColor  - the color of the font to display the message
  localeLang - the 2-char locale code (e.g. en) for the sender
  message    - the message to send
  toUserID   - the external user id of the receiver
   */
  BBB.sendPrivateChatMessage = function (fontColor, localeLang, message, toUserID, toUserName) {
    let messageForServer;
    messageForServer = {
      message: message,
      chat_type: 'PRIVATE_CHAT',
      from_userid: getInSession('userId'),
      from_username: BBB.getMyUserName(),
      from_tz_offset: '240',
      to_username: toUserName,
      to_userid: toUserID,
      from_lang: localeLang,
      from_time: getTime(),
      from_color: fontColor,
    };
    return Meteor.call('sendChatMessagetoServer', BBB.getMeetingId(), messageForServer, getInSession('userId'), getInSession('authToken'));
  };

  /*
  Request to display a presentation.
  presentationID - the presentation to display
   */
  BBB.displayPresentation = function (presentationID) {};

  /*
  Query the list of uploaded presentations.
   */
  BBB.queryListOfPresentations = function () {};

  /*
  Request to delete a presentation.
  presentationID - the presentation to delete
   */
  BBB.deletePresentation = function (presentationID) {};

  // Request to switch the presentation to the previous slide
  BBB.goToPreviousPage = function () {
    return Meteor.call('publishSwitchToPreviousSlideMessage', getInSession('meetingId'), getInSession('userId'), getInSession('authToken'));
  };

  // Request to switch the presentation to the next slide
  BBB.goToNextPage = function () {
    return Meteor.call('publishSwitchToNextSlideMessage', getInSession('meetingId'), getInSession('userId'), getInSession('authToken'));
  };

  BBB.webRTCConferenceCallStarted = function () {};

  BBB.webRTCConferenceCallConnecting = function () {};

  BBB.webRTCConferenceCallEnded = function () {};

  BBB.webRTCConferenceCallFailed = function (errorcode) {};

  BBB.webRTCConferenceCallWaitingForICE = function () {};

  BBB.webRTCCallProgressCallback = function (progress) {};

  BBB.webRTCEchoTestStarted = function () {};

  BBB.webRTCEchoTestConnecting = function () {};

  BBB.webRTCEchoTestFailed = function (reason) {};

  BBB.webRTCEchoTestWaitingForICE = function () {};

  BBB.webRTCEchoTestEnded = function () {};

  BBB.webRTCMediaRequest = function () {};

  BBB.webRTCMediaSuccess = function () {};

  BBB.webRTCMediaFail = function () {};

  BBB.webRTCWebcamRequest = function () {};

  BBB.webRTCWebcamRequestSuccess = function () {};

  BBB.webRTCWebcamRequestFail = function (reason) {};

  // Third-party JS apps should use this to query if the BBB SWF file is ready to handle calls.

  // ***********************************************************************************
  // *       Broadcasting of events to 3rd-party apps.
  // ************************************************************************************

  /*
  Stores the 3rd-party app event listeners **
   */
  listeners = {};

  /*
  3rd-party apps should use this method to register to listen for events.
   */
  BBB.listen = function (eventName, handler) {};

  /*
  3rd-party app should use this method to unregister listener for a given event.
   */
  BBB.unlisten = function (eventName, handler) {};

  BBB.init = function (callback) {};

  return BBB;
})();
