let moderator, presenter, viewer;

presenter = {
  switchSlide: true,
  subscribePoll: true,
  subscribeAnswers: true
};

moderator = {
  joinListenOnly: true,
  leaveListenOnly: true,
  raiseOwnHand: true,
  lowerOwnHand: true,
  muteSelf: true,
  unmuteSelf: true,
  logoutSelf: true,
  subscribeUsers: true,
  subscribeChat: true,
  chatPublic: true,
  chatPrivate: true,
  subscribePoll: true,
  subscribeAnswers: false,
  setEmojiStatus: true,
  clearEmojiStatus: true,
  kickUser: true,
  setPresenter: true
};

viewer = function(meetingId, userId) {
  let ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7;
  return {
    joinListenOnly: true,
    leaveListenOnly: true,
    raiseOwnHand: true,
    lowerOwnHand: true,
    muteSelf: true,
    unmuteSelf: !((ref = Meteor.Meetings.findOne({
      meetingId: meetingId
    })) != null ? ref.roomLockSettings.disableMic : void 0) || !((ref1 = Meteor.Users.findOne({
      meetingId: meetingId,
      userId: userId
    })) != null ? ref1.user.locked : void 0),
    logoutSelf: true,
    subscribeUsers: true,
    subscribeChat: true,
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
    subscribePoll: true,
    subscribeAnswers: false,
    setEmojiStatus: true,
    clearEmojiStatus: true
  };
};

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
  if((user != null) && authToken === user.authToken) {
    if(user.validated && user.clientType === "HTML5") {
      if((ref1 = user.user) != null ? ref1.presenter : void 0) {
        Meteor.log.info("user permissions presenter case");
        return presenter[action] || viewer(meetingId, userId)[action] || false;
      } else if(((ref2 = user.user) != null ? ref2.role : void 0) === 'VIEWER') {
        Meteor.log.info("user permissions viewer case");
        return viewer(meetingId, userId)[action] || false;
      } else if(((ref3 = user.user) != null ? ref3.role : void 0) === 'MODERATOR') {
        Meteor.log.info("user permissions moderator case");
        return moderator[action] || false;
      } else {
        Meteor.log.warn(`UNSUCCESSFULL ATTEMPT FROM userid=${userId} to perform:${action}`);
        return false;
      }
    } else {
      if(action === "logoutSelf") {
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
