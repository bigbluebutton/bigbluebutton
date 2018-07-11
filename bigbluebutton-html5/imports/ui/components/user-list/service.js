import Users from '/imports/api/users';
import Chat from '/imports/api/chat';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import UnreadMessages from '/imports/ui/services/unread-messages';
import Storage from '/imports/ui/services/storage/session';
import mapUser from '/imports/ui/services/user/mapUser';
import { EMOJI_STATUSES } from '/imports/utils/statuses';
import { makeCall } from '/imports/ui/services/api';
import _ from 'lodash';
import KEY_CODES from '/imports/utils/keyCodes';

const APP_CONFIG = Meteor.settings.public.app;
const ALLOW_MODERATOR_TO_UNMUTE_AUDIO = APP_CONFIG.allowModeratorToUnmuteAudio;

const CHAT_CONFIG = Meteor.settings.public.chat;
const PRIVATE_CHAT_TYPE = CHAT_CONFIG.type_private;
const PUBLIC_CHAT_USERID = CHAT_CONFIG.public_userid;

// session for closed chat list
const CLOSED_CHAT_LIST_KEY = 'closedChatList';

const mapOpenChats = (chat) => {
  const currentUserId = Auth.userID;
  return chat.fromUserId !== currentUserId
    ? chat.fromUserId
    : chat.toUserId;
};

const CUSTOM_LOGO_URL_KEY = 'CustomLogoUrl';

export const setCustomLogoUrl = path => Storage.setItem(CUSTOM_LOGO_URL_KEY, path);

const getCustomLogoUrl = () => Storage.getItem(CUSTOM_LOGO_URL_KEY);

const sortUsersByName = (a, b) => {
  if (a.name.toLowerCase() < b.name.toLowerCase()) {
    return -1;
  } else if (a.name.toLowerCase() > b.name.toLowerCase()) {
    return 1;
  } else if (a.id.toLowerCase() > b.id.toLowerCase()) {
    return -1;
  } else if (a.id.toLowerCase() < b.id.toLowerCase()) {
    return 1;
  }

  return 0;
};

const sortUsersByEmoji = (a, b) => {
  const { status: statusA } = a.emoji;
  const { status: statusB } = b.emoji;

  const emojiA = statusA in EMOJI_STATUSES ? EMOJI_STATUSES[statusA] : statusA;
  const emojiB = statusB in EMOJI_STATUSES ? EMOJI_STATUSES[statusB] : statusB;

  if (emojiA && emojiB && (emojiA !== EMOJI_STATUSES.none && emojiB !== EMOJI_STATUSES.none)) {
    if (a.emoji.changedAt < b.emoji.changedAt) {
      return -1;
    } else if (a.emoji.changedAt > b.emoji.changedAt) {
      return 1;
    }
  } else if (emojiA && emojiA !== EMOJI_STATUSES.none) {
    return -1;
  } else if (emojiB && emojiB !== EMOJI_STATUSES.none) {
    return 1;
  }
  return 0;
};

const sortUsersByModerator = (a, b) => {
  if (a.isModerator && b.isModerator) {
    return sortUsersByEmoji(a, b);
  } else if (a.isModerator) {
    return -1;
  } else if (b.isModerator) {
    return 1;
  }

  return 0;
};

const sortUsersByPhoneUser = (a, b) => {
  if (!a.isPhoneUser && !b.isPhoneUser) {
    return 0;
  } else if (!a.isPhoneUser) {
    return -1;
  } else if (!b.isPhoneUser) {
    return 1;
  }

  return 0;
};

const sortUsers = (a, b) => {
  let sort = sortUsersByModerator(a, b);

  if (sort === 0) {
    sort = sortUsersByEmoji(a, b);
  }

  if (sort === 0) {
    sort = sortUsersByPhoneUser(a, b);
  }

  if (sort === 0) {
    sort = sortUsersByName(a, b);
  }

  return sort;
};

const sortChatsByName = (a, b) => {
  if (a.name.toLowerCase() < b.name.toLowerCase()) {
    return -1;
  } else if (a.name.toLowerCase() > b.name.toLowerCase()) {
    return 1;
  } else if (a.id.toLowerCase() > b.id.toLowerCase()) {
    return -1;
  } else if (a.id.toLowerCase() < b.id.toLowerCase()) {
    return 1;
  }

  return 0;
};

const sortChatsByIcon = (a, b) => {
  if (a.icon && b.icon) {
    return sortChatsByName(a, b);
  } else if (a.icon) {
    return -1;
  } else if (b.icon) {
    return 1;
  }

  return 0;
};

const isPublicChat = chat => (
  chat.id === 'public'
);

const sortChats = (a, b) => {
  let sort = sortChatsByIcon(a, b);

  if (sort === 0) {
    sort = sortChatsByName(a, b);
  }

  return sort;
};

const userFindSorting = {
  emojiTime: 1,
  role: 1,
  phoneUser: 1,
  sortName: 1,
  userId: 1,
};

// move the current user to the top of the users list
const moveCurrentUserToTop = (users) => {
  let currUser;
  for (const user of users) {
    if (user.isCurrent) {
      // remove user, save it, break loop
      currUser = users.splice(users.indexOf(user), 1)[0];
      break;
    }
  }
  if (currUser) users.unshift(currUser); // add at the beginning
  return users;
};

const getUsers = () => {
  const users = Users
    .find({ connectionStatus: 'online' }, userFindSorting)
    .fetch();

  // note: after the sorting is done, we move current user to the top
  return moveCurrentUserToTop(users
    .map(mapUser)
    .sort(sortUsers));
};

const getOpenChats = (chatID) => {
  let openChats = Chat
    .find({ type: PRIVATE_CHAT_TYPE })
    .fetch()
    .map(mapOpenChats);

  if (chatID) {
    openChats.push(chatID);
  }

  openChats = _.uniq(openChats);

  openChats = Users
    .find({ userId: { $in: openChats } })
    .map(mapUser)
    .map((op) => {
      const openChat = op;
      openChat.unreadCounter = UnreadMessages.count(op.id);
      return openChat;
    });

  const currentClosedChats = Storage.getItem(CLOSED_CHAT_LIST_KEY) || [];
  const filteredChatList = [];

  openChats.forEach((op) => {
    // When a new private chat message is received, ensure the conversation view is restored.
    if (op.unreadCounter > 0) {
      if (_.indexOf(currentClosedChats, op.id) > -1) {
        Storage.setItem(CLOSED_CHAT_LIST_KEY, _.without(currentClosedChats, op.id));
      }
    }

    // Compare openChats with session and push it into filteredChatList
    // if one of the openChat is not in session.
    // It will pass to openChats.
    if (_.indexOf(currentClosedChats, op.id) < 0) {
      filteredChatList.push(op);
    }
  });

  openChats = filteredChatList;

  openChats.push({
    id: 'public',
    name: 'Public Chat',
    icon: 'group_chat',
    unreadCounter: UnreadMessages.count(PUBLIC_CHAT_USERID),
  });

  return openChats
    .sort(sortChats);
};

const isVoiceOnlyUser = userId => userId.toString().startsWith('v_');

const getAvailableActions = (currentUser, user, router, isBreakoutRoom) => {
  const isDialInUser = isVoiceOnlyUser(user.id) || user.isPhoneUser;

  const hasAuthority = currentUser.isModerator || user.isCurrent;

  const allowedToChatPrivately = !user.isCurrent && !isDialInUser;

  const allowedToMuteAudio = hasAuthority
                            && user.isVoiceUser
                            && !user.isMuted
                            && !user.isListenOnly;

  const allowedToUnmuteAudio = hasAuthority
                              && user.isVoiceUser
                              && !user.isListenOnly
                              && user.isMuted
                              && (ALLOW_MODERATOR_TO_UNMUTE_AUDIO || user.isCurrent);

  const allowedToResetStatus = hasAuthority
      && user.emoji.status !== EMOJI_STATUSES.none
      && !isDialInUser;

  // if currentUser is a moderator, allow removing other users
  const allowedToRemove = currentUser.isModerator && !user.isCurrent && !isBreakoutRoom;

  const allowedToSetPresenter = currentUser.isModerator
      && !user.isPresenter
      && !isDialInUser;

  const allowedToPromote = currentUser.isModerator
      && !user.isCurrent
      && !user.isModerator
      && !isDialInUser;

  const allowedToDemote = currentUser.isModerator
      && !user.isCurrent
      && user.isModerator
      && !isDialInUser;

  const allowedToChangeStatus = user.isCurrent;

  return {
    allowedToChatPrivately,
    allowedToMuteAudio,
    allowedToUnmuteAudio,
    allowedToResetStatus,
    allowedToRemove,
    allowedToSetPresenter,
    allowedToPromote,
    allowedToDemote,
    allowedToChangeStatus,
  };
};

const getCurrentUser = () => {
  const currentUserId = Auth.userID;
  const currentUser = Users.findOne({ userId: currentUserId });

  return (currentUser) ? mapUser(currentUser) : null;
};

const normalizeEmojiName = emoji => (
  emoji in EMOJI_STATUSES ? EMOJI_STATUSES[emoji] : emoji
);

const isMeetingLocked = (id) => {
  const meeting = Meetings.findOne({ meetingId: id });
  let isLocked = false;

  if (meeting.lockSettingsProp !== undefined) {
    const lockSettings = meeting.lockSettingsProp;

    if (lockSettings.disableCam
      || lockSettings.disableMic
      || lockSettings.disablePrivChat
      || lockSettings.disablePubChat) {
      isLocked = true;
    }
  }

  return isLocked;
};

const setEmojiStatus = (s) => {
  const statusAvailable = (Object.keys(EMOJI_STATUSES).includes(s));

  return statusAvailable
    ? makeCall('setEmojiStatus', Auth.userID, s)
    : makeCall('setEmojiStatus', s, 'none');
};

const assignPresenter = (userId) => { makeCall('assignPresenter', userId); };

const removeUser = (userId) => {
  if (isVoiceOnlyUser(userId)) {
    makeCall('ejectUserFromVoice', userId);
  } else {
    makeCall('removeUser', userId);
  }
};

const toggleVoice = (userId) => { userId === Auth.userID ? makeCall('toggleSelfVoice') : makeCall('toggleVoice', userId); };

const changeRole = (userId, role) => { makeCall('changeRole', userId, role); };

const roving = (event, itemCount, changeState) => {
  if (document.activeElement.getAttribute('data-isopen') === 'true') {
    const menuChildren = document.activeElement.getElementsByTagName('li');

    if ([KEY_CODES.ESCAPE, KEY_CODES.ARROW_LEFT].includes(event.keyCode)) {
      document.activeElement.click();
    }

    if ([KEY_CODES.ARROW_UP].includes(event.keyCode)) {
      menuChildren[menuChildren.length - 1].focus();
    }

    if ([KEY_CODES.ARROW_DOWN].includes(event.keyCode)) {
      for (let i = 0; i < menuChildren.length; i += 1) {
        if (menuChildren[i].hasAttribute('tabIndex')) {
          menuChildren[i].focus();
          break;
        }
      }
    }

    return;
  }

  if (this.selectedIndex === undefined) {
    this.selectedIndex = -1;
  }

  if ([KEY_CODES.ESCAPE, KEY_CODES.TAB].includes(event.keyCode)) {
    document.activeElement.blur();
    this.selectedIndex = -1;
    changeState(this.selectedIndex);
  }

  if (event.keyCode === KEY_CODES.ARROW_DOWN) {
    this.selectedIndex += 1;

    if (this.selectedIndex === itemCount) {
      this.selectedIndex = 0;
    }

    changeState(this.selectedIndex);
  }

  if (event.keyCode === KEY_CODES.ARROW_UP) {
    this.selectedIndex -= 1;

    if (this.selectedIndex < 0) {
      this.selectedIndex = itemCount - 1;
    }

    changeState(this.selectedIndex);
  }

  if ([KEY_CODES.ARROW_RIGHT, KEY_CODES.SPACE, KEY_CODES.ENTER].includes(event.keyCode)) {
    document.activeElement.firstChild.click();
  }
};

export default {
  setEmojiStatus,
  assignPresenter,
  removeUser,
  toggleVoice,
  changeRole,
  getUsers,
  getOpenChats,
  getCurrentUser,
  getAvailableActions,
  normalizeEmojiName,
  isMeetingLocked,
  isPublicChat,
  roving,
  setCustomLogoUrl,
  getCustomLogoUrl,
  getEmojiList: () => EMOJI_STATUSES,
  getEmoji: () => Users.findOne({ userId: Auth.userID }).emoji,
};
