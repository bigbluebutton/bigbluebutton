import Users from '/imports/api/users';
import GroupChat from '/imports/api/group-chat';
import GroupChatMsg from '/imports/api/group-chat-msg';
import Breakouts from '/imports/api/breakouts/';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import UnreadMessages from '/imports/ui/services/unread-messages';
import Storage from '/imports/ui/services/storage/session';
import mapUser from '/imports/ui/services/user/mapUser';
import { EMOJI_STATUSES } from '/imports/utils/statuses';
import { makeCall } from '/imports/ui/services/api';
import _ from 'lodash';
import KEY_CODES from '/imports/utils/keyCodes';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;

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

const getCustomLogoUrl = () => Storage.getItem(CUSTOM_LOGO_URL_KEY);

const sortUsersByName = (a, b) => {
  if (a.name.toLowerCase() < b.name.toLowerCase()) {
    return -1;
  } if (a.name.toLowerCase() > b.name.toLowerCase()) {
    return 1;
  } if (a.id.toLowerCase() > b.id.toLowerCase()) {
    return -1;
  } if (a.id.toLowerCase() < b.id.toLowerCase()) {
    return 1;
  }

  return 0;
};

const sortUsersByEmoji = (a, b) => {
  const { status: statusA } = a.emoji;
  const { status: statusB } = b.emoji;

  const emojiA = statusA in EMOJI_STATUSES ? EMOJI_STATUSES[statusA] : statusA;
  const emojiB = statusB in EMOJI_STATUSES ? EMOJI_STATUSES[statusB] : statusB;

  if (emojiA && emojiB && (emojiA !== 'none' && emojiB !== 'none')) {
    if (a.emoji.changedAt < b.emoji.changedAt) {
      return -1;
    } if (a.emoji.changedAt > b.emoji.changedAt) {
      return 1;
    }
  } if (emojiA && emojiA !== 'none') {
    return -1;
  } if (emojiB && emojiB !== 'none') {
    return 1;
  }
  return 0;
};

const sortUsersByModerator = (a, b) => {
  if (a.isModerator && b.isModerator) {
    return sortUsersByEmoji(a, b);
  } if (a.isModerator) {
    return -1;
  } if (b.isModerator) {
    return 1;
  }

  return 0;
};

const sortUsersByPhoneUser = (a, b) => {
  if (!a.isPhoneUser && !b.isPhoneUser) {
    return 0;
  } if (!a.isPhoneUser) {
    return -1;
  } if (!b.isPhoneUser) {
    return 1;
  }

  return 0;
};

// current user's name is always on top
const sortUsersByCurrent = (a, b) => {
  if (a.isCurrent) {
    return -1;
  } if (b.isCurrent) {
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
  } if (a.id.toLowerCase() > b.id.toLowerCase()) {
    return -1;
  } if (a.id.toLowerCase() < b.id.toLowerCase()) {
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

const getUsers = () => {
  const users = Users
    .find({
      meetingId: Auth.meetingID,
      connectionStatus: 'online',
    }, userFindSorting)
    .fetch();

  return users
    .map(mapUser)
    .sort(sortUsers);
};

const getUsersId = () => getUsers().map(u => u.id);

const hasBreakoutRoom = () => Breakouts.find({ parentMeetingId: Auth.meetingID }).count() > 0;

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
    .map(mapUser)
    .map((op) => {
      const activeChat = op;
      activeChat.unreadCounter = UnreadMessages.count(op.id);
      return activeChat;
    });

  const currentClosedChats = Storage.getItem(CLOSED_CHAT_LIST_KEY) || [];
  const filteredChatList = [];

  activeChats.forEach((op) => {
    // When a new private chat message is received, ensure the conversation view is restored.
    if (op.unreadCounter > 0) {
      if (_.indexOf(currentClosedChats, op.id) > -1) {
        Storage.setItem(CLOSED_CHAT_LIST_KEY, _.without(currentClosedChats, op.id));
      }
    }

    // Compare activeChats with session and push it into filteredChatList
    // if one of the activeChat is not in session.
    // It will pass to activeChats.
    if (_.indexOf(currentClosedChats, op.id) < 0) {
      filteredChatList.push(op);
    }
  });

  activeChats = filteredChatList;

  activeChats.push({
    id: 'public',
    name: 'Public Chat',
    icon: 'group_chat',
    unreadCounter: UnreadMessages.count(PUBLIC_GROUP_CHAT_ID),
  });

  return activeChats
    .sort(sortChats);
};

const isVoiceOnlyUser = userId => userId.toString().startsWith('v_');

const isMeetingLocked = (id) => {
  const meeting = Meetings.findOne({ meetingId: id });
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
  const meeting = Meetings.findOne({ meetingId: Auth.meetingID });
  if (meeting.usersProp) {
    return meeting.usersProp.allowModsToUnmuteUsers;
  }
  return false;
}

const getAvailableActions = (currentUser, user, isBreakoutRoom) => {
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
    && (user.isCurrent || areUsersUnmutable());

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
    && !isDialInUser
    && !isBreakoutRoom;

  const allowedToDemote = currentUser.isModerator
    && !user.isCurrent
    && user.isModerator
    && !isDialInUser
    && !isBreakoutRoom;

  const allowedToChangeStatus = user.isCurrent;

  const allowedToChangeUserLockStatus = currentUser.isModerator
    && !user.isModerator && isMeetingLocked(Auth.meetingID);

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

const getCurrentUser = () => {
  const currentUserId = Auth.userID;
  const currentUser = Users.findOne({ userId: currentUserId });

  return (currentUser) ? mapUser(currentUser) : null;
};

const normalizeEmojiName = emoji => (
  emoji in EMOJI_STATUSES ? EMOJI_STATUSES[emoji] : emoji
);

const setEmojiStatus = (data) => {
  const statusAvailable = (Object.keys(EMOJI_STATUSES).includes(data));

  return statusAvailable
    ? makeCall('setEmojiStatus', Auth.userID, data)
    : makeCall('setEmojiStatus', data, 'none');
};

const assignPresenter = (userId) => { makeCall('assignPresenter', userId); };

const removeUser = (userId) => {
  if (isVoiceOnlyUser(userId)) {
    makeCall('ejectUserFromVoice', userId);
  } else {
    makeCall('removeUser', userId);
  }
};

const toggleVoice = (userId) => {
  if (userId === Auth.userID) {
    makeCall('toggleSelfVoice');
  } else {
    makeCall('toggleVoice', userId);
  }
};

const muteAllUsers = (userId) => { makeCall('muteAllUsers', userId); };

const muteAllExceptPresenter = (userId) => { makeCall('muteAllExceptPresenter', userId); };

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

const hasPrivateChatBetweenUsers = (sender, receiver) => GroupChat
  .findOne({ users: { $all: [receiver.id, sender.id] } });

const getGroupChatPrivate = (sender, receiver) => {
  if (!hasPrivateChatBetweenUsers(sender, receiver)) {
    makeCall('createGroupChat', receiver);
  }
};

const isUserModerator = (userId) => {
  const u = Users.findOne({ userId });
  return u ? u.moderator : false;
};

const toggleUserLock = (userId, lockStatus) => {
  makeCall('toggleUserLock', userId, lockStatus);
};

const requestUserInformation = (userId) => {
  makeCall('requestUserInformation', userId);
};

export default {
  setEmojiStatus,
  assignPresenter,
  removeUser,
  toggleVoice,
  muteAllUsers,
  muteAllExceptPresenter,
  changeRole,
  getUsers,
  getUsersId,
  getActiveChats,
  getCurrentUser,
  getAvailableActions,
  normalizeEmojiName,
  isMeetingLocked,
  isPublicChat,
  roving,
  setCustomLogoUrl,
  getCustomLogoUrl,
  getGroupChatPrivate,
  hasBreakoutRoom,
  isUserModerator,
  getEmojiList: () => EMOJI_STATUSES,
  getEmoji: () => Users.findOne({ userId: Auth.userID }).emoji,
  hasPrivateChatBetweenUsers,
  toggleUserLock,
  requestUserInformation,
};
