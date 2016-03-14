Template.displayUserIcons.events({
  'click .muteIcon'(event) {
    return toggleMic(this);
  },

  'click .raisedHandIcon'(event) {
    // the function to call 'userLowerHand'
    // the meeting id
    // the _id of the person whose land is to be lowered
    // the userId of the person who is lowering the hand
    return BBB.lowerHand(getInSession('meetingId'), this.userId, getInSession('userId'), getInSession('authToken'));
  },

  'click .kickUser'(event) {
    return kickUser(BBB.getMeetingId(), this.userId, getInSession('userId'), getInSession('authToken'));
  },
});

Template.displayUserIcons.helpers({
  userLockedIconApplicable(userId) {
    // the lock settings affect the user (and requiire a lock icon) if
    // the user is set to be locked and there is a relevant lock in place
    let lockInAction, locked, ref, ref1, settings;
    locked = (ref = BBB.getUser(userId)) != null ? ref.user.locked : void 0;
    settings = (ref1 = Meteor.Meetings.findOne()) != null ? ref1.roomLockSettings : void 0;
    lockInAction = settings.disablePrivateChat || settings.disableCam || settings.disableMic || settings.lockedLayout || settings.disablePublicChat;
    return locked && lockInAction;
  },
});

// Opens a private chat tab when a username from the userlist is clicked
Template.usernameEntry.events({
  'click .usernameEntry'(event) {
    let ref, userIdSelected;
    userIdSelected = this.userId;
    if (userIdSelected !== null) {
      if (userIdSelected === ((ref = BBB.getCurrentUser()) != null ? ref.userId : void 0)) {
        setInSession('inChatWith', 'PUBLIC_CHAT');
      } else {
        setInSession('inChatWith', userIdSelected);
      }
    }

    if (isPortrait() || isPortraitMobile()) {
      toggleUserlistMenu();
      toggleShield();
    }

    return setTimeout(() => { // waits until the end of execution queue
      return $('#newMessageInput').focus();
    }, 0);
  },

  'click .gotUnreadMail'(event) {
    let _id, _this, chat, chats, currentId, i, len;
    _this = this;
    currentId = getInSession('userId');
    if (currentId !== void 0 && currentId === _this.userId) {
      _id = 'PUBLIC_CHAT';
    } else {
      _id = _this.userId;
    }

    chats = getInSession('chats');
    if (chats !== void 0) {
      for (i = 0, len = chats.length; i < len; i++) {
        chat = chats[i];
        if (chat.userId === _id) {
          chat.gotMail = false;
          chat.number = 0;
          break;
        }
      }

      return setInSession('chats', chats);
    }
  },

  'click .setPresenter'(event) {
    return setUserPresenter(BBB.getMeetingId(), this.userId, getInSession('userId'), this.user.name, getInSession('authToken'));
  },
});

Template.usernameEntry.helpers({
  hasGotUnreadMailClass(userId) {
    let chat, chats, i, len;
    chats = getInSession('chats');
    if (chats !== void 0) {
      for (i = 0, len = chats.length; i < len; i++) {
        chat = chats[i];
        if (chat.userId === userId && chat.gotMail) {
          return true;
        }
      }
    }

    return false;
  },

  getNumberOfUnreadMessages(userId) {
    let chat, chats, i, len;
    chats = getInSession('chats');
    if (chats !== void 0) {
      for (i = 0, len = chats.length; i < len; i++) {
        chat = chats[i];
        if (chat.userId === userId && chat.gotMail) {
          if (chat.number > 9) {
            return '9+';
          } else {
            return chat.number;
          }
        }
      }
    }
  },
});
