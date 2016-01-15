let moderator, presenter, viewer;

presenter = {
  switchSlide: true,

  //poll
  subscribePoll: true,
  subscribeAnswers: true
};

// holds the values for whether the moderator user is allowed to perform an action (true)
// or false if not allowed. Some actions have dynamic values depending on the current lock settings
moderator = {
  // audio listen only
  joinListenOnly: true,
  leaveListenOnly: true,

  // join audio with mic cannot be controlled on the server side as it is
  // a client side only functionality

  // raising/lowering hand
  raiseOwnHand: true,
  lowerOwnHand: true,

  // muting
  muteSelf: true,
  unmuteSelf: true,

  logoutSelf: true,

  //subscribing
  subscribeUsers: true,
  subscribeChat: true,

  //chat
  chatPublic: true,
  chatPrivate: true,

  //poll
  subscribePoll: true,
  subscribeAnswers: false,

  //emojis
  setEmojiStatus: true,
  clearEmojiStatus: true,

  //user control
  kickUser: true,
  setPresenter: true
};

// holds the values for whether the viewer user is allowed to perform an action (true)
// or false if not allowed. Some actions have dynamic values depending on the current lock settings
viewer = function(meetingId, userId) {
  let ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7;
  return {

    // listen only
    joinListenOnly: true,
    leaveListenOnly: true,

    // join audio with mic cannot be controlled on the server side as it is
    // a client side only functionality

    // raising/lowering hand
    raiseOwnHand: true,
    lowerOwnHand: true,

    // muting
    muteSelf: true,
    unmuteSelf: !((ref = Meteor.Meetings.findOne({
      meetingId: meetingId
    })) != null ? ref.roomLockSettings.disableMic : void 0) || !((ref1 = Meteor.Users.findOne({
      meetingId: meetingId,
      userId: userId
    })) != null ? ref1.user.locked : void 0),

    logoutSelf: true,

    //subscribing
    subscribeUsers: true,
    subscribeChat: true,

    //chat
    chatPublic: !((ref2 = Meteor.Meetings.findOne({
      meetingId: meetingId
    })) != null ? ref2.roomLockSettings.disablePublicChat : void 0) || !((ref3 = Meteor.Users.findOne({
      meetingId: meetingId,
      userId: userId
    })) != null ? ref3.user.locked : void 0) || ((ref4 = Meteor.Users.findOne({
      meetingId: meetingId,
      userId: userId
    })) != null ? ref4.user.presenter : void 0),
    chatPrivate: !((ref5 = Meteor.Meetings.findOne({
      meetingId: meetingId
    })) != null ? ref5.roomLockSettings.disablePrivateChat : void 0) || !((ref6 = Meteor.Users.findOne({
      meetingId: meetingId,
      userId: userId
    })) != null ? ref6.user.locked : void 0) || ((ref7 = Meteor.Users.findOne({
      meetingId: meetingId,
      userId: userId
    })) != null ? ref7.user.presenter : void 0),

    //poll
    subscribePoll: true,
    subscribeAnswers: false,

    //emojis
    setEmojiStatus: true,
    clearEmojiStatus: true
  };
};

// carries out the decision making for actions affecting users. For the list of
// actions and the default value - see 'viewer' and 'moderator' in the beginning of the file
this.isAllowedTo = function(action, meetingId, userId, authToken) {
  let ref, ref1, ref2, ref3, user, validated;
  validated = (ref = Meteor.Users.findOne({
    meetingId: meetingId,
    userId: userId
  })) != null ? ref.validated : void 0;
  Meteor.log.info(`in isAllowedTo: action-${action}, userId=${userId}, authToken=${authToken} validated:${validated}`);
  user = Meteor.Users.findOne({
    meetingId: meetingId,
    userId: userId
  });
  // Meteor.log.info "user=" + JSON.stringify user
  if((user != null) && authToken === user.authToken) { // check if the user is who he claims to be
    if(user.validated && user.clientType === "HTML5") {

      // PRESENTER
      // check presenter specific actions or fallback to regular viewer actions
      if((ref1 = user.user) != null ? ref1.presenter : void 0) {
        Meteor.log.info("user permissions presenter case");
        return presenter[action] || viewer(meetingId, userId)[action] || false;

      // VIEWER
      } else if(((ref2 = user.user) != null ? ref2.role : void 0) === 'VIEWER') {
        Meteor.log.info("user permissions viewer case");
        return viewer(meetingId, userId)[action] || false;

      // MODERATOR
      } else if(((ref3 = user.user) != null ? ref3.role : void 0) === 'MODERATOR') {
        Meteor.log.info("user permissions moderator case");
        return moderator[action] || false;
      } else {
        Meteor.log.warn(`UNSUCCESSFULL ATTEMPT FROM userid=${userId} to perform:${action}`);
        return false;
      }
    } else {
      // user was not validated
      if(action === "logoutSelf") {
        // on unsuccessful sign-in
        Meteor.log.warn("a user was successfully removed from the meeting following an unsuccessful login");
        return true;
      }
      return false;
    }
  } else {
    Meteor.log.error(`..while the authToken was ${user != null ? user.authToken : void 0}    and the user's object is ${JSON.stringify(user)}in meetingId=${meetingId} userId=${userId} tried to perform ${action} without permission${"\n..while the authToken was " + (user != null ? user.authToken : void 0) + "    and the user's object is " + (JSON.stringify(user))}`);
    return false;
  }
};
