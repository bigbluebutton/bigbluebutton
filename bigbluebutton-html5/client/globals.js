this.getBuildInformation = function () {
  let copyrightYear, defaultWelcomeMessage, defaultWelcomeMessageFooter, html5ClientBuild, link, ref, ref1, ref2, ref3;
  copyrightYear = ((ref = Meteor.config) != null ? ref.copyrightYear : void 0) || 'DATE';
  html5ClientBuild = ((ref1 = Meteor.config) != null ? ref1.html5ClientBuild : void 0) || 'VERSION';
  defaultWelcomeMessage = ((ref2 = Meteor.config) != null ? ref2.defaultWelcomeMessage : void 0) || 'WELCOME MESSAGE';
  defaultWelcomeMessageFooter = ((ref3 = Meteor.config) != null ? ref3.defaultWelcomeMessageFooter : void 0) || 'WELCOME MESSAGE';
  link = "<a href='http://bigbluebutton.org/' target='_blank'>http://bigbluebutton.org</a>";
  return {
    copyrightYear: copyrightYear,
    html5ClientBuild: html5ClientBuild,
    defaultWelcomeMessage: defaultWelcomeMessage,
    defaultWelcomeMessageFooter: defaultWelcomeMessageFooter,
    link: link,
  };
};

// Convert a color `value` as integer to a hex color (e.g. 255 to #0000ff)
this.colourToHex = function (value) {
  let hex;
  hex = parseInt(value).toString(16);
  while (hex.length < 6) {
    hex = `0${hex}`;
  }

  return `#${hex}`;
};

// color can be a number (a hex converted to int) or a string (e.g. "#ffff00")
this.formatColor = function (color) {
  if (color == null) {
    color = '0'; // default value
  }

  if (!color.toString().match(/\#.*/)) {
    color = colourToHex(color);
  }

  return color;
};

this.getInSession = function (k) {
  return SessionAmplify.get(k);
};

// returns epoch in ms
this.getTime = function () {
  return (new Date).valueOf();
};

// checks if the pan gesture is mostly horizontal
this.isPanHorizontal = function (event) {
  return Math.abs(event.deltaX) > Math.abs(event.deltaY);
};

// helper to determine whether user has joined any type of audio
Handlebars.registerHelper('amIInAudio', () => {
  return BBB.amIInAudio();
});

// helper to determine whether the user is in the listen only audio stream
Handlebars.registerHelper('amIListenOnlyAudio', () => {
  return BBB.amIListenOnlyAudio();
});

// helper to determine whether the user is in the listen only audio stream
Handlebars.registerHelper('isMyMicLocked', () => {
  return BBB.isMyMicLocked();
});

Handlebars.registerHelper('colourToHex', (_this => {
  return function (value) {
    return _this.window.colourToHex(value);
  };
})(this));

Handlebars.registerHelper('equals', (a, b) => { // equals operator was dropped in Meteor's migration from Handlebars to Spacebars
  return a === b;
});

Handlebars.registerHelper('getCurrentMeeting', () => {
  return Meteor.Meetings.findOne();
});

Handlebars.registerHelper('getCurrentSlide', () => {
  let result;
  result = BBB.getCurrentSlide();

  // console.log "result=#{JSON.stringify result}"
  return result;
});

// Allow access through all templates
Handlebars.registerHelper('getInSession', k => {
  return SessionAmplify.get(k);
});

Handlebars.registerHelper('getMeetingName', () => {
  return BBB.getMeetingName();
});

Handlebars.registerHelper('getShapesForSlide', () => {
  let currentSlide, ref;
  currentSlide = BBB.getCurrentSlide();

  // try to reuse the lines above
  return Meteor.Shapes.find({
    whiteboardId: currentSlide != null ? (ref = currentSlide.slide) != null ? ref.id : void 0 : void 0,
  });
});

// retrieves all users in the meeting
Handlebars.registerHelper('getUsersInMeeting', () => {
  let users;
  users = Meteor.Users.find().fetch();
  if ((users != null ? users.length : void 0) > 1) {
    return getSortedUserList(users);
  } else {
    return users;
  }
});

Handlebars.registerHelper('getWhiteboardTitle', () => {
  return BBB.currentPresentationName() || 'No active presentation';
});

Handlebars.registerHelper('getCurrentUserEmojiStatus', () => {
  let ref, ref1;
  return (ref = BBB.getCurrentUser()) != null ? (ref1 = ref.user) != null ? ref1.emoji_status : void 0 : void 0;
});

Handlebars.registerHelper('isCurrentUser', userId => {
  let ref;
  return userId === null || userId === ((ref = BBB.getCurrentUser()) != null ? ref.userId : void 0);
});

Handlebars.registerHelper('isCurrentUserMuted', () => {
  return BBB.amIMuted();
});

//Retreives a username for a private chat tab from the database if it exists
Handlebars.registerHelper('privateChatName', () => {
  let obj, ref;
  obj = Meteor.Users.findOne({
    userId: getInSession('inChatWith'),
  });
  if (obj != null) {
    return obj != null ? (ref = obj.user) != null ? ref.name : void 0 : void 0;
  }
});

Handlebars.registerHelper('isCurrentUserEmojiStatusSet', () => {
  return BBB.isCurrentUserEmojiStatusSet();
});

Handlebars.registerHelper('isCurrentUserSharingVideo', () => {
  return BBB.amISharingVideo();
});

Handlebars.registerHelper('isCurrentUserTalking', () => {
  return BBB.amITalking();
});

Handlebars.registerHelper('isCurrentUserPresenter', () => {
  return BBB.isUserPresenter(getInSession('userId'));
});

Handlebars.registerHelper('isCurrentUserModerator', () => {
  return BBB.getMyRole() === 'MODERATOR';
});

Handlebars.registerHelper('isDisconnected', () => {
  return !Meteor.status().connected;
});

Handlebars.registerHelper('isUserInAudio', userId => {
  return BBB.isUserInAudio(userId);
});

Handlebars.registerHelper('isUserListenOnlyAudio', userId => {
  return BBB.isUserListenOnlyAudio(userId);
});

Handlebars.registerHelper('isUserMuted', userId => {
  return BBB.isUserMuted(userId);
});

Handlebars.registerHelper('isUserSharingVideo', userId => {
  return BBB.isUserSharingWebcam(userId);
});

Handlebars.registerHelper('isUserTalking', userId => {
  return BBB.isUserTalking(userId);
});

Handlebars.registerHelper('isMobile', () => {
  return isMobile();
});

Handlebars.registerHelper('isPortraitMobile', () => {
  return isPortraitMobile();
});

Handlebars.registerHelper('isMobileChromeOrFirefox', () => {
  return isMobile() && ((getBrowserName() === 'Chrome') || (getBrowserName() === 'Firefox'));
});

Handlebars.registerHelper('meetingIsRecording', () => {
  return BBB.isMeetingRecording();
});

Handlebars.registerHelper('messageFontSize', () => {
  return {
    style: `font-size: ${getInSession('messageFontSize')}px;`,
  };
});

Handlebars.registerHelper('pointerLocation', () => {
  let currentPresentation, currentSlideDoc, pointer, presentationId, ref;
  currentPresentation = Meteor.Presentations.findOne({
    'presentation.current': true,
  });
  presentationId = currentPresentation != null ? (ref = currentPresentation.presentation) != null ? ref.id : void 0 : void 0;
  currentSlideDoc = Meteor.Slides.findOne({
    presentationId: presentationId,
    'slide.current': true,
  });
  pointer = Meteor.Cursor.findOne();
  pointer.x = (-currentSlideDoc.slide.x_offset * 2 + currentSlideDoc.slide.width_ratio * pointer.x) / 100;
  pointer.y = (-currentSlideDoc.slide.y_offset * 2 + currentSlideDoc.slide.height_ratio * pointer.y) / 100;
  return pointer;
});

Handlebars.registerHelper('safeName', str => {
  return safeString(str);
});

Handlebars.registerHelper('canJoinWithMic', () => {
  if ((BBB.isUserPresenter(getInSession('userId')) || !Meteor.config.app.listenOnly) && !BBB.isMyMicLocked()) {
    return true;
  } else {
    return false;
  }
});

/*Handlebars.registerHelper "visibility", (section) ->
  if getInSession "display_#{section}"
    style: 'display:block;'
  else
    style: 'display:none;'
 */

Handlebars.registerHelper('visibility', section => {
  return {
    style: 'display:block;',
  };
});

Handlebars.registerHelper('containerPosition', section => {
  if (getInSession('display_usersList')) {
    return 'moved-to-right';
  } else if (getInSession('display_menu')) {
    return 'moved-to-left';
  } else {
    return '';
  }
});

// vertically shrinks the whiteboard if the slide navigation controllers are present
Handlebars.registerHelper('whiteboardSize', section => {
  if (BBB.isUserPresenter(getInSession('userId'))) {
    return 'presenter-whiteboard';
  } else {
    if (BBB.isPollGoing(getInSession('userId'))) {
      return 'poll-whiteboard';
    } else {
      return 'viewer-whiteboard';
    }
  }
});

Handlebars.registerHelper('getPollQuestions', () => {
  let answer, buttonStyle, j, len, marginStyle, number, polls, ref, widthStyle;
  polls = BBB.getCurrentPoll(getInSession('userId'));
  if ((polls != null) && polls !== void 0) {
    number = polls.poll_info.poll.answers.length;
    widthStyle = `width: calc(75%/${number});`;
    marginStyle = `margin-left: calc(25%/${number * 2});margin-right: calc(25%/${number * 2});`;
    buttonStyle = widthStyle + marginStyle;
    ref = polls.poll_info.poll.answers;
    for (j = 0, len = ref.length; j < len; j++) {
      answer = ref[j];
      answer.style = buttonStyle;
    }

    return polls.poll_info.poll.answers;
  }
});

Template.registerHelper('emojiIcons', function () {
  return [
    { name: 'sad', icon: 'sad-face', title: '' },
    { name: 'happy', icon: 'happy-face', title: ''},
    { name: 'confused', icon: 'confused-face', title: ''},
    { name: 'neutral', icon: 'neutral-face', title: ''},
    { name: 'away', icon: 'clock', title: ''},
    { name: 'raiseHand', icon: 'hand', title: 'Lower your Hand'}
  ];
});

this.getSortedUserList = function (users) {
  if ((users != null ? users.length : void 0) > 1) {
    users.sort((a, b) => {
      let aTime, bTime;
      if (a.user.role === 'MODERATOR' && b.user.role === 'MODERATOR') {
        if (a.user.set_emoji_time && b.user.set_emoji_time) {
          aTime = a.user.set_emoji_time.getTime();
          bTime = b.user.set_emoji_time.getTime();
          if (aTime < bTime) {
            return -1;
          } else {
            return 1;
          }
        } else if (a.user.set_emoji_time) {
          return -1;
        } else if (b.user.set_emoji_time) {
          return 1;
        }
      } else if (a.user.role === 'MODERATOR') {
        return -1;
      } else if (b.user.role === 'MODERATOR') {
        return 1;
      } else if (a.user.set_emoji_time && b.user.set_emoji_time) {
        aTime = a.user.set_emoji_time.getTime();
        bTime = b.user.set_emoji_time.getTime();
        if (aTime < bTime) {
          return -1;
        } else {
          return 1;
        }
      } else if (a.user.set_emoji_time) {
        return -1;
      } else if (b.user.set_emoji_time) {
        return 1;
      } else if (!a.user.phone_user && !b.user.phone_user) {

      } else if (!a.user.phone_user) {
        return -1;
      } else if (!b.user.phone_user) {
        return 1;
      }

      //Check name (case-insensitive) in the event of a tie up above. If the name
      //is the same then use userID which should be unique making the order the same
      //across all clients.

      if (a.user._sort_name < b.user._sort_name) {
        return -1;
      } else if (a.user._sort_name > b.user._sort_name) {
        return 1;
      } else if (a.user.userid.toLowerCase() > b.user.userid.toLowerCase()) {
        return -1;
      } else if (a.user.userid.toLowerCase() < b.user.userid.toLowerCase()) {
        return 1;
      }
    });
  }

  return users;
};

// transform plain text links into HTML tags compatible with Flash client
this.linkify = function (str) {
  return str = str.replace(re_weburl, "<a href='event:$&'><u>$&</u></a>");
};

this.setInSession = function (k, v) {
  return SessionAmplify.set(k, v);
};

this.safeString = function (str) {
  if (typeof str === 'string') {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
};

this.toggleCam = function (event) {
  // Meteor.Users.update {_id: context._id} , {$set:{"user.sharingVideo": !context.sharingVideo}}
  // Meteor.call('userToggleCam', context._id, !context.sharingVideo)
};

this.toggleChatbar = function () {
  setInSession('display_chatbar', !getInSession('display_chatbar'));
  if (!getInSession('display_chatbar')) {
    $('#whiteboard').css('width', '100%');
    $('#whiteboard .ui-resizable-handle').css('display', 'none');
  } else {
    $('#whiteboard').css('width', '');
    $('#whiteboard .ui-resizable-handle').css('display', '');
  }

  return setTimeout(scaleWhiteboard, 0);
};

this.toggleMic = function (event) {
  return BBB.toggleMyMic();
};

this.toggleUsersList = function () {
  if ($('.userlistMenu').hasClass('hiddenInLandscape')) {
    $('.userlistMenu').removeClass('hiddenInLandscape');
  } else {
    $('.userlistMenu').addClass('hiddenInLandscape');
  }

  return setTimeout(scaleWhiteboard, 0);
};

this.populateNotifications = function (msg) {
  let chat, chats, initChats, j, l, len, len1, myPrivateChats, myUserId, new_msg_userid, results, u, uniqueArray, users;
  myUserId = getInSession('userId');
  users = Meteor.Users.find().fetch();

  // assuming that I only have access only to private messages where I am the sender or the recipient
  myPrivateChats = Meteor.Chat.find({
    'message.chat_type': 'PRIVATE_CHAT',
  }).fetch();
  uniqueArray = [];
  for (j = 0, len = myPrivateChats.length; j < len; j++) {
    chat = myPrivateChats[j];
    if (chat.message.to_userid === myUserId) {
      uniqueArray.push({
        userId: chat.message.from_userid,
        username: chat.message.from_username,
      });
    }

    if (chat.message.from_userid === myUserId) {
      uniqueArray.push({
        userId: chat.message.to_userid,
        username: chat.message.to_username,
      });
    }
  }

  //keep unique entries only
  uniqueArray = uniqueArray.filter((itm, i, a) => {
    return i === a.indexOf(itm);
  });
  if (msg.message.to_userid === myUserId) {
    new_msg_userid = msg.message.from_userid;
  }

  if (msg.message.from_userid === myUserId) {
    new_msg_userid = msg.message.to_userid;
  }

  chats = getInSession('chats');
  if (chats === void 0) {
    initChats = [
      {
        userId: 'PUBLIC_CHAT',
        gotMail: false,
        number: 0,
      },
    ];
    setInSession('chats', initChats);
  }

  results = [];

  //insert the unique entries in the collection
  for (l = 0, len1 = uniqueArray.length; l < len1; l++) {
    u = uniqueArray[l];
    chats = getInSession('chats');
    if (chats.filter(chat => {
      return chat.userId === u.userId;
    }).length === 0 && u.userId === new_msg_userid) {
      chats.push({
        userId: u.userId,
        gotMail: false,
        number: 0,
      });
      results.push(setInSession('chats', chats));
    } else {
      results.push(void 0);
    }
  }

  return results;
};

this.toggleShield = function () {
  if (parseFloat($('.shield').css('opacity')) === 0.5) {
    $('.shield').css('opacity', '');
  }

  if (!$('.shield').hasClass('darken') && !$('.shield').hasClass('animatedShield')) {
    return $('.shield').addClass('darken');
  } else {
    $('.shield').removeClass('darken');
    return $('.shield').removeClass('animatedShield');
  }
};

this.removeFullscreenStyles = function () {
  $('#whiteboard-paper').removeClass('vertically-centered');
  $('#chat').removeClass('invisible');
  $('#users').removeClass('invisible');
  $('#navbar').removeClass('invisible');
  $('.FABTriggerButton').removeClass('invisible');
  $('.fullscreenButton').removeClass('exitFullscreenButton');
  $('.fullscreenButton').addClass('whiteboardFullscreenButton');
  $('.fullscreenButton i').removeClass('ion-arrow-shrink');
  return $('.fullscreenButton i').addClass('ion-arrow-expand');
};

this.enterWhiteboardFullscreen = function () {
  let element;
  element = document.getElementById('whiteboard');
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
    $('.fullscreenButton').addClass('iconFirefox');
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
    $('.fullscreenButton').addClass('iconChrome');
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }

  $('#chat').addClass('invisible');
  $('#users').addClass('invisible');
  $('#navbar').addClass('invisible');
  $('.FABTriggerButton').addClass('invisible');
  $('.fullscreenButton').removeClass('whiteboardFullscreenButton');
  $('.fullscreenButton').addClass('exitFullscreenButton');
  $('.fullscreenButton i').removeClass('ion-arrow-expand');
  $('.fullscreenButton i').addClass('ion-arrow-shrink');
  $('#whiteboard-paper').addClass('vertically-centered');
  $('#whiteboard').bind('webkitfullscreenchange', e => {
    if (document.webkitFullscreenElement === null) {
      $('#whiteboard').unbind('webkitfullscreenchange');
      $('.fullscreenButton').removeClass('iconChrome');
      removeFullscreenStyles();
      return scaleWhiteboard();
    }
  });
  return $(document).bind('mozfullscreenchange', e => {
    if (document.mozFullScreenElement === null) {
      $(document).unbind('mozfullscreenchange');
      $('.fullscreenButton').removeClass('iconFirefox');
      removeFullscreenStyles();
      return scaleWhiteboard();
    }
  });
};

this.closeMenus = function () {
  if ($('.userlistMenu').hasClass('menuOut')) {
    return toggleUserlistMenu();
  } else if ($('.settingsMenu').hasClass('menuOut')) {
    return toggleSettingsMenu();
  }
};

// Periodically check the status of the WebRTC call, when a call has been established attempt to hangup,
// retry if a call is in progress, send the leave voice conference message to BBB
this.exitVoiceCall = function (event, afterExitCall) {
  let checkToHangupCall, hangupCallback;

  // To be called when the hangup is initiated
  hangupCallback = function () {
    return console.log('Exiting Voice Conference');
  };

  // Checks periodically until a call is established so we can successfully end the call
  // clean state
  getInSession('triedHangup', false);

  // function to initiate call
  (checkToHangupCall = function (context) {
    // if an attempt to hang up the call is made when the current session is not yet finished, the request has no effect
    // keep track in the session if we haven't tried a hangup
    if (BBB.getCallStatus() !== null && !getInSession('triedHangup')) {
      console.log('Attempting to hangup on WebRTC call');
      if (BBB.amIListenOnlyAudio()) {
        Meteor.call(
          'listenOnlyRequestToggle',
          BBB.getMeetingId(),
          getInSession('userId'),
          getInSession('authToken'),
          false
        );
      }

      BBB.leaveVoiceConference(hangupCallback);
      getInSession('triedHangup', true);
      notification_WebRTCAudioExited();
      if (afterExitCall) {
        return afterExitCall(this, Meteor.config.app.listenOnly);
      }
    } else {
      console.log(
        `RETRYING hangup on WebRTC call in ${Meteor.config.app.WebRTCHangupRetryInterval} ms`
      );
      return setTimeout(checkToHangupCall, Meteor.config.app.WebRTCHangupRetryInterval);
    }
  })(this); // automatically run function
  return false;
};

// close the daudio UI, then join the conference. If listen only send the request to the server
this.joinVoiceCall = function (event, arg) {
  let isListenOnly, joinCallback;
  isListenOnly = (arg != null ? arg : {}).isListenOnly;
  if (!isWebRTCAvailable()) {
    notification_WebRTCNotSupported();
    return;
  }

  if (isListenOnly == null) {
    isListenOnly = true;
  }

  // create voice call params
  joinCallback = function (message) {
    return console.log('Beginning WebRTC Conference Call');
  };

  notification_WebRTCAudioJoining();
  if (isListenOnly) {
    Meteor.call(
      'listenOnlyRequestToggle',
      BBB.getMeetingId(),
      getInSession('userId'),
      getInSession('authToken'),
      true
    );
  }

  BBB.joinVoiceConference(joinCallback, isListenOnly); // make the call //TODO should we apply role permissions to this action?
  return false;
};

// Starts the entire logout procedure.
// meeting: the meeting the user is in
// the user's userId
this.userLogout = function (meeting, user) {
  Meteor.call('userLogout', meeting, user, getInSession('authToken'));
  console.log('logging out');
  return clearSessionVar(document.location = getInSession('logoutURL')); // navigate to logout
};

this.kickUser = function (meetingId, toKickUserId, requesterUserId, authToken) {
  return Meteor.call('kickUser', meetingId, toKickUserId, requesterUserId, authToken);
};

this.setUserPresenter = function (
  meetingId,
  newPresenterId,
  requesterSetPresenter,
  newPresenterName,
  authToken) {
  return Meteor.call('setUserPresenter', meetingId, newPresenterId, requesterSetPresenter, newPresenterName, authToken);
};

// Clear the local user session
this.clearSessionVar = function (callback) {
  amplify.store('authToken', null);
  amplify.store('bbbServerVersion', null);
  amplify.store('chats', null);
  amplify.store('dateOfBuild', null);
  amplify.store('display_chatPane', null);
  amplify.store('display_chatbar', null);
  amplify.store('display_navbar', null);
  amplify.store('display_usersList', null);
  amplify.store('display_whiteboard', null);
  amplify.store('inChatWith', null);
  amplify.store('logoutURL', null);
  amplify.store('meetingId', null);
  amplify.store('messageFontSize', null);
  amplify.store('tabsRenderedTime', null);
  amplify.store('userId', null);
  amplify.store('display_menu', null);
  if (callback != null) {
    return callback();
  }
};

// assign the default values for the Session vars
this.setDefaultSettings = function () {
  let initChats;
  setInSession('display_navbar', true);
  setInSession('display_chatbar', true);
  setInSession('display_whiteboard', true);
  setInSession('display_chatPane', true);

  //if it is a desktop version of the client
  if (isPortraitMobile() || isLandscapeMobile()) {
    setInSession('messageFontSize', Meteor.config.app.mobileFont);
  } else { //if this is a mobile version of the client
    setInSession('messageFontSize', Meteor.config.app.desktopFont);
  }

  setInSession('display_slidingMenu', false);
  setInSession('display_hiddenNavbarSection', false);
  if (isLandscape()) {
    setInSession('display_usersList', true);
  } else {
    setInSession('display_usersList', false);
  }

  setInSession('display_menu', false);
  setInSession('chatInputMinHeight', 0);

  //keep notifications and an opened private chat tab if page was refreshed
  //reset to default if that's a new user
  if (loginOrRefresh()) {
    initChats = [
      {
        userId: 'PUBLIC_CHAT',
        gotMail: false,
        number: 0,
      },
    ];
    setInSession('chats', initChats);
    setInSession('inChatWith', 'PUBLIC_CHAT');
  }

  return TimeSync.loggingEnabled = false; // suppresses the log messages from timesync
};

//true if it is a new user, false if the client was just refreshed
this.loginOrRefresh = function () {
  let checkId, userId;
  userId = getInSession('userId');
  checkId = getInSession('checkId');
  if (checkId === void 0) {
    setInSession('checkId', userId);
    return true;
  } else if (userId !== checkId) {
    setInSession('checkId', userId);
    return true;
  } else {
    return false;
  }
};

this.onLoadComplete = function () {
  let ref;
  document.title = `BigBlueButton ${(ref = BBB.getMeetingName()) != null ? ref : 'HTML5'}`;
  setDefaultSettings();
  Meteor.Users.find().observe({
    removed(oldDocument) {
      if (oldDocument.userId === getInSession('userId')) {
        return document.location = getInSession('logoutURL');
      }
    },
  });
  return Meteor.Users.find().observe({
    changed(newUser, oldUser) {
      if (Meteor.config.app.listenOnly === true && newUser.user.presenter === false && oldUser.user.presenter === true && BBB.getCurrentUser().userId === newUser.userId && oldUser.user.listenOnly === false) {
        return exitVoiceCall(this, joinVoiceCall);
      }
    },
  });
};

// Detects a mobile device
this.isMobile = function () {
  return navigator.userAgent.match(/Android/i) ||
    navigator.userAgent.match(/iPhone|iPad|iPod/i) ||
    navigator.userAgent.match(/BlackBerry/i) ||
    navigator.userAgent.match(/Windows Phone/i) ||
    navigator.userAgent.match(/IEMobile/i) ||
    navigator.userAgent.match(/BlackBerry/i) ||
    navigator.userAgent.match(/webOS/i);
};

this.isLandscape = function () {
  return !isMobile() &&
    window.matchMedia('(orientation: landscape)').matches && // browser is landscape
    window.matchMedia('(min-device-aspect-ratio: 1/1)').matches; // device is landscape
};

this.isPortrait = function () {
  return !isMobile() &&
    window.matchMedia('(orientation: portrait)').matches && // browser is portrait
    window.matchMedia('(min-device-aspect-ratio: 1/1)').matches; // device is landscape
};

// Checks if the view is portrait and a mobile device is being used
this.isPortraitMobile = function () {
  return isMobile() &&
    window.matchMedia('(orientation: portrait)').matches && // browser is portrait
    window.matchMedia('(max-device-aspect-ratio: 1/1)').matches; // device is portrait
};

// Checks if the view is landscape and mobile device is being used
this.isLandscapeMobile = function () {
  return isMobile() &&
    window.matchMedia('(orientation: landscape)').matches && // browser is landscape
    window.matchMedia('(min-device-aspect-ratio: 1/1)').matches; // device is landscape
};

this.isLandscapePhone = function () {
  // @phone-landscape media query:
  return window.matchMedia('(orientation: landscape)').matches &&
    window.matchMedia('(min-device-aspect-ratio: 1/1)').matches &&
    window.matchMedia('(max-device-width: 959px)').matches;
};

this.isPortraitPhone = function () {
  // @phone-portrait media query:
  return (window.matchMedia('(orientation: portrait)').matches &&
    window.matchMedia('(max-device-aspect-ratio: 1/1)').matches &&
    window.matchMedia('(max-device-width: 480px)').matches) ||

    // @phone-portrait-with-keyboard media query:
    (window.matchMedia('(orientation: landscape)').matches &&
    window.matchMedia('(max-device-aspect-ratio: 1/1)').matches &&
    window.matchMedia('(max-device-width: 480px)').matches);
};

this.isPhone = function () {
  return isLandscapePhone() || isPortraitPhone();
};

// The webpage orientation is now landscape
this.orientationBecameLandscape = function () {
  return adjustChatInputHeight();
};

// The webpage orientation is now portrait
this.orientationBecamePortrait = function () {
  return adjustChatInputHeight();
};

// Checks if only one panel (userlist/whiteboard/chatbar) is currently open
this.isOnlyOnePanelOpen = function () {
  //return (getInSession("display_usersList") ? 1 : 0) + (getInSession("display_whiteboard") ? 1 : 0) + (getInSession("display_chatbar") ? 1 : 0) === 1
  return getInSession('display_usersList') + getInSession('display_whiteboard') + getInSession('display_chatbar') === 1;
};

// determines which browser is being used
this.getBrowserName = function () {
  if (navigator.userAgent.match(/Chrome/i)) {
    return 'Chrome';
  } else if (navigator.userAgent.match(/Firefox/i)) {
    return 'Firefox';
  } else if (navigator.userAgent.match(/Safari/i)) {
    return 'Safari';
  } else if (navigator.userAgent.match(/Trident/i)) {
    return 'IE';
  } else {
    return null;
  }
};

this.scrollChatDown = function () {
  let ref;
  return $('#chatbody').scrollTop((ref = $('#chatbody')[0]) != null ? ref.scrollHeight : void 0);
};

// changes the height of the chat input area if needed (based on the textarea content)
this.adjustChatInputHeight = function () {
  let projectedHeight, ref;
  if (isLandscape()) {
    $('#newMessageInput').css('height', 'auto');
    projectedHeight = $('#newMessageInput')[0].scrollHeight + 23;
    if (projectedHeight !== $('.panel-footer').height() && projectedHeight >= getInSession('chatInputMinHeight')) {
      $('#newMessageInput').css('overflow', 'hidden'); // prevents a scroll bar

      // resizes the chat input area
      $('.panel-footer').css('top', `${-(projectedHeight - 70)}px`);
      $('.panel-footer').css('height', `${projectedHeight}px`);

      $('#newMessageInput').height($('#newMessageInput')[0].scrollHeight);

      // resizes the chat messages container
      $('#chatbody').height($('#chat').height() - projectedHeight - 45);
      $('#chatbody').scrollTop((ref = $('#chatbody')[0]) != null ? ref.scrollHeight : void 0);
    }

    return $('#newMessageInput').css('height', '');
  } else if (isPortrait()) {
    $('.panel-footer').attr('style', '');
    $('#chatbody').attr('style', '');
    return $('#newMessageInput').attr('style', '');
  }
};

this.toggleEmojisFAB = function () {
  if ($('.FABContainer').hasClass('openedFAB')) {
    $('.FABContainer > button:nth-child(2)').css('opacity', $('.FABContainer > button:nth-child(2)').css('opacity'));
    $('.FABContainer > button:nth-child(3)').css('opacity', $('.FABContainer > button:nth-child(3)').css('opacity'));
    $('.FABContainer > button:nth-child(4)').css('opacity', $('.FABContainer > button:nth-child(4)').css('opacity'));
    $('.FABContainer > button:nth-child(5)').css('opacity', $('.FABContainer > button:nth-child(5)').css('opacity'));
    $('.FABContainer > button:nth-child(6)').css('opacity', $('.FABContainer > button:nth-child(6)').css('opacity'));
    $('.FABContainer > button:nth-child(7)').css('opacity', $('.FABContainer > button:nth-child(7)').css('opacity'));
    $('.FABContainer').removeClass('openedFAB');
    return $('.FABContainer').addClass('closedFAB');
  } else {
    $('.FABContainer > button:nth-child(2)').css('opacity', $('.FABContainer > button:nth-child(2)').css('opacity'));
    $('.FABContainer > button:nth-child(3)').css('opacity', $('.FABContainer > button:nth-child(3)').css('opacity'));
    $('.FABContainer > button:nth-child(4)').css('opacity', $('.FABContainer > button:nth-child(4)').css('opacity'));
    $('.FABContainer > button:nth-child(5)').css('opacity', $('.FABContainer > button:nth-child(5)').css('opacity'));
    $('.FABContainer > button:nth-child(6)').css('opacity', $('.FABContainer > button:nth-child(6)').css('opacity'));
    $('.FABContainer > button:nth-child(7)').css('opacity', $('.FABContainer > button:nth-child(7)').css('opacity'));
    $('.FABContainer').removeClass('closedFAB');
    return $('.FABContainer').addClass('openedFAB');
  }
};

this.toggleUserlistMenu = function () {
  // menu
  if ($('.userlistMenu').hasClass('menuOut')) {
    $('.userlistMenu').removeClass('menuOut');
  } else {
    $('.userlistMenu').addClass('menuOut');
  }

  // icon
  if ($('.toggleUserlistButton').hasClass('menuToggledOn')) {
    return $('.toggleUserlistButton').removeClass('menuToggledOn');
  } else {
    return $('.toggleUserlistButton').addClass('menuToggledOn');
  }
};

this.toggleSettingsMenu = function () {
  // menu
  if ($('.settingsMenu').hasClass('menuOut')) {
    $('.settingsMenu').removeClass('menuOut');
  } else {
    $('.settingsMenu').addClass('menuOut');
  }

  // icon
  if ($('.toggleMenuButton').hasClass('menuToggledOn')) {
    return $('.toggleMenuButton').removeClass('menuToggledOn');
  } else {
    return $('.toggleMenuButton').addClass('menuToggledOn');
  }
};
