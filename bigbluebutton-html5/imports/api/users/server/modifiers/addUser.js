import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';

import stringHash from 'string-hash';
import flat from 'flat';

import addVoiceUser from '/imports/api/voice-users/server/modifiers/addVoiceUser';
import changeRole from '/imports/api/users/server/modifiers/changeRole';

import Meetings from '/imports/api/meetings';
import addChat from '/imports/api/chat/server/modifiers/addChat';
import clearUserSystemMessages from '/imports/api/chat/server/modifiers/clearUserSystemMessages';

const COLOR_LIST = [
  '#7b1fa2', '#6a1b9a', '#4a148c', '#5e35b1', '#512da8', '#4527a0',
  '#311b92', '#3949ab', '#303f9f', '#283593', '#1a237e', '#1976d2', '#1565c0',
  '#0d47a1', '#0277bd', '#01579b',
];

// add some default welcoming message to the chat (welcome / mod only)
const addWelcomingChatMessage = (messageText, meetingId, userId) => {
  const CHAT_CONFIG = Meteor.settings.public.chat;

  const message = {
    message: messageText,
    fromColor: '0x3399FF',
    toUserId: userId,
    toUsername: CHAT_CONFIG.type_system,
    fromUserId: CHAT_CONFIG.type_system,
    fromUsername: '',
    fromTime: (new Date()).getTime(),
  };

  addChat(meetingId, message);
};

export default function addUser(meetingId, user) {
  check(meetingId, String);

  check(user, {
    intId: String,
    extId: String,
    name: String,
    role: String,
    guest: Boolean,
    authed: Boolean,
    waitingForAcceptance: Boolean,
    emoji: String,
    presenter: Boolean,
    locked: Boolean,
    avatar: String,
    clientType: String,
  });

  const userId = user.intId;
  check(userId, String);

  const selector = {
    meetingId,
    userId,
  };

  const USER_CONFIG = Meteor.settings.public.user;
  const ROLE_PRESENTER = USER_CONFIG.role_presenter;
  const ROLE_MODERATOR = USER_CONFIG.role_moderator;
  const ROLE_VIEWER = USER_CONFIG.role_viewer;
  const APP_CONFIG = Meteor.settings.public.app;
  const ALLOW_HTML5_MODERATOR = APP_CONFIG.allowHTML5Moderator;

  // override moderator status of html5 client users, depending on a system flag
  const dummyUser = Users.findOne(selector);
  let userRole = user.role;

  if (
    dummyUser &&
    dummyUser.clientType === 'HTML5' &&
    userRole === ROLE_MODERATOR &&
    !ALLOW_HTML5_MODERATOR
  ) {
    userRole = ROLE_VIEWER;
  }

  /* While the akka-apps dont generate a color we just pick one
    from a list based on the userId */
  const color = COLOR_LIST[stringHash(user.intId) % COLOR_LIST.length];

  const modifier = {
    $set: Object.assign(
      {
        meetingId,
        connectionStatus: 'online',
        roles: [ROLE_VIEWER.toLowerCase()],
        sortName: user.name.trim().toLowerCase(),
        color,
      },
      flat(user),
    ),
  };

  addVoiceUser(meetingId, {
    voiceUserId: '',
    intId: userId,
    callerName: user.name,
    callerNum: '',
    muted: false,
    talking: false,
    callingWith: '',
    listenOnly: false,
    voiceConf: '',
    joined: false,
  });

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding user to collection: ${err}`);
    }

    clearUserSystemMessages(meetingId, userId);

    const Meeting = Meetings.findOne({ meetingId });
    addWelcomingChatMessage(
      Meeting.welcomeProp.welcomeMsg,
      meetingId, userId,
    );

    if (user.presenter) {
      changeRole(ROLE_PRESENTER, true, userId, meetingId);
    }

    if (userRole === ROLE_MODERATOR) {
      changeRole(ROLE_MODERATOR, true, userId, meetingId);
      if (Meeting.welcomeProp.modOnlyMessage) {
        addWelcomingChatMessage(
          Meeting.welcomeProp.modOnlyMessage,
          meetingId, userId,
        );
      }
    }

    const { insertedId } = numChanged;
    if (insertedId) {
      return Logger.info(`Added user id=${userId} meeting=${meetingId}`);
    }

    return Logger.info(`Upserted user id=${userId} meeting=${meetingId}`);
  };

  return Users.upsert(selector, modifier, cb);
}
