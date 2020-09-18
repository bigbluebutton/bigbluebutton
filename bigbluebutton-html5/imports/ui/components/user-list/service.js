import Users from '/imports/api/users';
import VoiceUsers from '/imports/api/voice-users';
import GroupChat from '/imports/api/group-chat';
import { GroupChatMsg } from '/imports/api/group-chat-msg';
import Breakouts from '/imports/api/breakouts/';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import UnreadMessages from '/imports/ui/services/unread-messages';
import Storage from '/imports/ui/services/storage/session';
import { EMOJI_STATUSES } from '/imports/utils/statuses';
import { makeCall } from '/imports/ui/services/api';
import _ from 'lodash';
import KEY_CODES from '/imports/utils/keyCodes';
import AudioService from '/imports/ui/components/audio/service';
import logger from '/imports/startup/client/logger';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;
const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;
const ROLE_VIEWER = Meteor.settings.public.user.role_viewer;

const DIAL_IN_CLIENT_TYPE = 'dial-in-user';

// session for closed chat list
const CLOSED_CHAT_LIST_KEY = 'closedChatList';

const mapActiveChats = (chat) => {
  const currentUserId = Auth.userID;

  if (chat.sender !== currentUserId) {
    return chat.sender;
  }

  const { chatId } = chat;

  const userId = GroupChat.findOne({ chatId }).users.filter(user => user !== currentUserId);

  return userId[0];
};

const CUSTOM_LOGO_URL_KEY = 'CustomLogoUrl';

export const setCustomLogoUrl = path => Storage.setItem(CUSTOM_LOGO_URL_KEY, path);

export const setModeratorOnlyMessage = msg => Storage.setItem('ModeratorOnlyMessage', msg);

const getCustomLogoUrl = () => Storage.getItem(CUSTOM_LOGO_URL_KEY);

const sortUsersByName = (a, b) => {
  const aName = a.name.toLowerCase();
  const bName = b.name.toLowerCase();

  if (aName < bName) {
    return -1;
  } if (aName > bName) {
    return 1;
  } if (a.userId > b.userId) {
    return -1;
  } if (a.userId < b.userId) {
    return 1;
  }

  return 0;
};

const sortUsersByEmoji = (a, b) => {
  if (a.emoji && b.emoji && (a.emoji !== 'none' && b.emoji !== 'none')) {
    if (a.emojiTime < b.emojiTime) {
      return -1;
    } if (a.emojiTime > b.emojiTime) {
      return 1;
    }
  } if (a.emoji && a.emoji !== 'none') {
    return -1;
  } if (b.emoji && b.emoji !== 'none') {
    return 1;
  }
  return 0;
};

const sortUsersByModerator = (a, b) => {
  if (a.role === ROLE_MODERATOR && b.role === ROLE_MODERATOR) {
    return 0;
  } if (a.role === ROLE_MODERATOR) {
    return -1;
  } if (b.role === ROLE_MODERATOR) {
    return 1;
  }

  return 0;
};

const sortUsersByPhoneUser = (a, b) => {
  if (!a.clientType === DIAL_IN_CLIENT_TYPE && !b.clientType === DIAL_IN_CLIENT_TYPE) {
    return 0;
  } if (!a.clientType === DIAL_IN_CLIENT_TYPE) {
    return -1;
  } if (!b.clientType === DIAL_IN_CLIENT_TYPE) {
    return 1;
  }

  return 0;
};

// current user's name is always on top
const sortUsersByCurrent = (a, b) => {
  if (a.userId === Auth.userID) {
    return -1;
  } if (b.userId === Auth.userID) {
    return 1;
  }

  return 0;
};

const sortUsers = (a, b) => {
  let sort = sortUsersByCurrent(a, b);

  if (sort === 0) {
    sort = sortUsersByModerator(a, b);
  }

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
  } if (a.name.toLowerCase() > b.name.toLowerCase()) {
    return 1;
  } if (a.userId.toLowerCase() > b.userId.toLowerCase()) {
    return -1;
  } if (a.userId.toLowerCase() < b.userId.toLowerCase()) {
    return 1;
  }

  return 0;
};

const sortChatsByIcon = (a, b) => {
  if (a.icon && b.icon) {
    return sortChatsByName(a, b);
  } if (a.icon) {
    return -1;
  } if (b.icon) {
    return 1;
  }

  return 0;
};

const isPublicChat = chat => (
  chat.userId === 'public'
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
  name: 1,
  userId: 1,
};

const getUsers = () => {
  let users = Users
    .find({
      meetingId: Auth.meetingID,
      connectionStatus: 'online',
    }, userFindSorting)
    .fetch();

  const currentUser = Users.findOne({ userId: Auth.userID }, { fields: { role: 1, locked: 1 } });
  if (currentUser && currentUser.role === ROLE_VIEWER && currentUser.locked) {
    const meeting = Meetings.findOne({ meetingId: Auth.meetingID },
      { fields: { 'lockSettingsProps.hideUserList': 1 } });
    if (meeting && meeting.lockSettingsProps && meeting.lockSettingsProps.hideUserList) {
      const moderatorOrCurrentUser = u => u.role === ROLE_MODERATOR || u.userId === Auth.userID;
      users = users.filter(moderatorOrCurrentUser);
    }
  }

  return users.sort(sortUsers);
};

const hasBreakoutRoom = () => Breakouts.find({ parentMeetingId: Auth.meetingID },
  { fields: {} }).count() > 0;

const isMe = userId => userId === Auth.userID;

const getActiveChats = (chatID) => {
  const privateChat = GroupChat
    .find({ users: { $all: [Auth.userID] } })
    .fetch()
    .map(chat => chat.chatId);

  const filter = {
    chatId: { $ne: PUBLIC_GROUP_CHAT_ID },
  };

  if (privateChat) {
    filter.chatId = { $in: privateChat };
  }

  let activeChats = GroupChatMsg
    .find(filter)
    .fetch()
    .map(mapActiveChats);

  if (chatID) {
    activeChats.push(chatID);
  }

  activeChats = _.uniq(_.compact(activeChats));

  activeChats = Users
    .find({ userId: { $in: activeChats } })
    .map((op) => {
      const activeChat = op;
      activeChat.unreadCounter = UnreadMessages.count(op.userId);
      activeChat.name = op.name;
      activeChat.isModerator = op.role === ROLE_MODERATOR;
      return activeChat;
    });

  const currentClosedChats = Storage.getItem(CLOSED_CHAT_LIST_KEY) || [];
  const filteredChatList = [];

  activeChats.forEach((op) => {
    // When a new private chat message is received, ensure the conversation view is restored.
    if (op.unreadCounter > 0) {
      if (_.indexOf(currentClosedChats, op.userId) > -1) {
        Storage.setItem(CLOSED_CHAT_LIST_KEY, _.without(currentClosedChats, op.userId));
      }
    }

    // Compare activeChats with session and push it into filteredChatList
    // if one of the activeChat is not in session.
    // It will pass to activeChats.
    if (_.indexOf(currentClosedChats, op.userId) < 0) {
      filteredChatList.push(op);
    }
  });

  activeChats = filteredChatList;

  activeChats.push({
    userId: 'public',
    name: 'Public Chat',
    icon: 'group_chat',
    unreadCounter: UnreadMessages.count(PUBLIC_GROUP_CHAT_ID),
  });

  return activeChats
    .sort(sortChats);
};

const isVoiceOnlyUser = userId => userId.toString().startsWith('v_');

const isMeetingLocked = (id) => {
  const meeting = Meetings.findOne({ meetingId: id }, { fields: { lockSettingsProps: 1 } });
  let isLocked = false;

  if (meeting.lockSettingsProps !== undefined) {
    const lockSettings = meeting.lockSettingsProps;

    if (lockSettings.disableCam
      || lockSettings.disableMic
      || lockSettings.disablePrivateChat
      || lockSettings.disablePublicChat) {
      isLocked = true;
    }
  }

  return isLocked;
};

const areUsersUnmutable = () => {
  const meeting = Meetings.findOne({ meetingId: Auth.meetingID },
    { fields: { 'usersProp.allowModsToUnmuteUsers': 1 } });
  if (meeting.usersProp) {
    return meeting.usersProp.allowModsToUnmuteUsers;
  }
  return false;
};

const curatedVoiceUser = (intId) => {
  const voiceUser = VoiceUsers.findOne({ intId });
  return {
    isVoiceUser: voiceUser ? voiceUser.joined : false,
    isMuted: voiceUser ? voiceUser.muted && !voiceUser.listenOnly : false,
    isTalking: voiceUser ? voiceUser.talking && !voiceUser.muted : false,
    isListenOnly: voiceUser ? voiceUser.listenOnly : false,
  };
};

const getAvailableActions = (amIModerator, isBreakoutRoom, subjectUser, subjectVoiceUser) => {
  const isDialInUser = isVoiceOnlyUser(subjectUser.userId) || subjectUser.phone_user;
  const amISubjectUser = isMe(subjectUser.userId);
  const isSubjectUserModerator = subjectUser.role === ROLE_MODERATOR;

  const hasAuthority = amIModerator || amISubjectUser;
  const allowedToChatPrivately = !amISubjectUser && !isDialInUser;
  const allowedToMuteAudio = hasAuthority
    && subjectVoiceUser.isVoiceUser
    && !subjectVoiceUser.isMuted
    && !subjectVoiceUser.isListenOnly;

  const allowedToUnmuteAudio = hasAuthority
    && subjectVoiceUser.isVoiceUser
    && !subjectVoiceUser.isListenOnly
    && subjectVoiceUser.isMuted
    && (amISubjectUser || areUsersUnmutable());

  const allowedToResetStatus = hasAuthority
    && subjectUser.emoji !== EMOJI_STATUSES.none
    && !isDialInUser;

  // if currentUser is a moderator, allow removing other users
  const allowedToRemove = amIModerator
    && !amISubjectUser
    && !isBreakoutRoom;

  const allowedToSetPresenter = amIModerator
    && !subjectUser.presenter
    && !isDialInUser;

  const allowedToPromote = amIModerator
    && !amISubjectUser
    && !isSubjectUserModerator
    && !isDialInUser
    && !isBreakoutRoom;

  const allowedToDemote = amIModerator
    && !amISubjectUser
    && isSubjectUserModerator
    && !isDialInUser
    && !isBreakoutRoom;

  const allowedToChangeStatus = amISubjectUser;

  const allowedToChangeUserLockStatus = amIModerator
    && !isSubjectUserModerator
    && isMeetingLocked(Auth.meetingID);

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
    allowedToChangeUserLockStatus,
  };
};

const normalizeEmojiName = emoji => (
  emoji in EMOJI_STATUSES ? EMOJI_STATUSES[emoji] : emoji
);

const setEmojiStatus = (userId, emoji) => {
  const statusAvailable = (Object.keys(EMOJI_STATUSES).includes(emoji));

  return statusAvailable
    ? makeCall('setEmojiStatus', Auth.userID, emoji)
    : makeCall('setEmojiStatus', userId, 'none');
};

const assignPresenter = (userId) => { makeCall('assignPresenter', userId); };

const removeUser = (userId, banUser) => {
  if (isVoiceOnlyUser(userId)) {
    makeCall('ejectUserFromVoice', userId);
  } else {
    makeCall('removeUser', userId, banUser);
  }
};

const toggleVoice = (userId) => {
  if (userId === Auth.userID) {
    AudioService.toggleMuteMicrophone();
  } else {
    makeCall('toggleVoice', userId);
    logger.info({
      logCode: 'usermenu_option_mute_toggle_audio',
      extraInfo: { logType: 'moderator_action', userId },
    }, 'moderator muted user microphone');
  }
};

const muteAllUsers = (userId) => { makeCall('muteAllUsers', userId); };

const muteAllExceptPresenter = (userId) => { makeCall('muteAllExceptPresenter', userId); };

const changeRole = (userId, role) => { makeCall('changeRole', userId, role); };

const roving = (event, changeState, elementsList, element) => {
  this.selectedElement = element;
  const menuOpen = Session.get('dropdownOpen') || false;

  if (menuOpen) {
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

  if ([KEY_CODES.ESCAPE, KEY_CODES.TAB].includes(event.keyCode)) {
    document.activeElement.blur();
    changeState(null);
  }

  if (event.keyCode === KEY_CODES.ARROW_DOWN) {
    const firstElement = elementsList.firstChild;
    let elRef = element ? element.nextSibling : firstElement;
    elRef = elRef || firstElement;
    changeState(elRef);
  }

  if (event.keyCode === KEY_CODES.ARROW_UP) {
    const lastElement = elementsList.lastChild;
    let elRef = element ? element.previousSibling : lastElement;
    elRef = elRef || lastElement;
    changeState(elRef);
  }

  if ([KEY_CODES.ARROW_RIGHT, KEY_CODES.SPACE, KEY_CODES.ENTER].includes(event.keyCode)) {
    document.activeElement.firstChild.click();
  }
};

const hasPrivateChatBetweenUsers = (senderId, receiverId) => GroupChat
  .findOne({ users: { $all: [receiverId, senderId] } });

const getGroupChatPrivate = (senderUserId, receiver) => {
  if (!hasPrivateChatBetweenUsers(senderUserId, receiver.userId)) {
    makeCall('createGroupChat', receiver);
  }
};

const toggleUserLock = (userId, lockStatus) => {
  makeCall('toggleUserLock', userId, lockStatus);
};

const requestUserInformation = (userId) => {
  makeCall('requestUserInformation', userId);
};

const sortUsersByFirstName = (a, b) => {
  const aName = a.firstName.toLowerCase();
  const bName = b.firstName.toLowerCase();
  if (aName < bName) return -1;
  if (aName > bName) return 1;
  return 0;
};

const sortUsersByLastName = (a, b) => {
  if (!a.lastName && !b.lastName) return 0;
  if (a.lastName && !b.lastName) return -1;
  if (!a.lastName && b.lastName) return 1;

  const aName = a.lastName.toLowerCase();
  const bName = b.lastName.toLowerCase();

  if (aName < bName) return -1;
  if (aName > bName) return 1;
  return 0;
};

const isUserPresenter = (userId) => {
  const user = Users.findOne({ userId },
    { fields: { presenter: 1 } });
  return user ? user.presenter : false;
};

export const getUserNamesLink = (docTitle, fnSortedLabel, lnSortedLabel) => {
  const mimeType = 'text/plain';
  const userNamesObj = getUsers()
    .map((u) => {
      const name = u.name.split(' ');
      return ({
        firstName: name[0],
        middleNames: name.length > 2 ? name.slice(1, name.length - 1) : null,
        lastName: name.length > 1 ? name[name.length - 1] : null,
      });
    });

  const getUsernameString = (user) => {
    const { firstName, middleNames, lastName } = user;
    return `${firstName || ''} ${middleNames && middleNames.length > 0 ? middleNames.join(' ') : ''} ${lastName || ''}`;
  };

  const namesByFirstName = userNamesObj.sort(sortUsersByFirstName)
    .map(u => getUsernameString(u)).join('\r\n');

  const namesByLastName = userNamesObj.sort(sortUsersByLastName)
    .map(u => getUsernameString(u)).join('\r\n');

  const namesListsString = `${docTitle}\r\n\r\n${fnSortedLabel}\r\n${namesByFirstName}
    \r\n\r\n${lnSortedLabel}\r\n${namesByLastName}`.replace(/ {2}/g, ' ');

  const link = document.createElement('a');
  link.setAttribute('download', `save-users-list-${Date.now()}.txt`);
  link.setAttribute(
    'href',
    `data: ${mimeType} ;charset=utf-16,${encodeURIComponent(namesListsString)}`,
  );
  return link;
};

export default {
  sortUsersByName,
  sortUsers,
  setEmojiStatus,
  assignPresenter,
  removeUser,
  toggleVoice,
  muteAllUsers,
  muteAllExceptPresenter,
  changeRole,
  getUsers,
  getActiveChats,
  getAvailableActions,
  curatedVoiceUser,
  normalizeEmojiName,
  isMeetingLocked,
  isPublicChat,
  roving,
  getCustomLogoUrl,
  getGroupChatPrivate,
  hasBreakoutRoom,
  getEmojiList: () => EMOJI_STATUSES,
  getEmoji: () => Users.findOne({ userId: Auth.userID }, { fields: { emoji: 1 } }).emoji,
  hasPrivateChatBetweenUsers,
  toggleUserLock,
  requestUserInformation,
  isUserPresenter,
};
