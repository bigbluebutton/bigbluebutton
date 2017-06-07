import Users from '/imports/api/users';
import Chat from '/imports/api/chat';
import Auth from '/imports/ui/services/auth';
import UnreadMessages from '/imports/ui/services/unread-messages';
import Storage from '/imports/ui/services/storage/session';
import { EMOJI_STATUSES } from '/imports/utils/statuses.js';
import _ from 'lodash';

const CHAT_CONFIG = Meteor.settings.public.chat;
const USER_CONFIG = Meteor.settings.public.user;
const ROLE_MODERATOR = USER_CONFIG.role_moderator;
const PRIVATE_CHAT_TYPE = CHAT_CONFIG.type_private;

// session for closed chat list
const CLOSED_CHAT_LIST_KEY = 'closedChatList';

/* TODO: Same map is done in the chat/service we should share this someway */

const mapUser = user => ({
  id: user.userid,
  name: user.name,
  emoji: {
    status: user.emoji_status,
    changedAt: user.set_emoji_time,
  },
  isPresenter: user.presenter,
  isModerator: user.role === ROLE_MODERATOR,
  isCurrent: user.userid === Auth.userID,
  isVoiceUser: user.voiceUser.joined,
  isMuted: user.voiceUser.muted,
  isTalking: user.voiceUser.talking,
  isListenOnly: user.listenOnly,
  isSharingWebcam: user.webcam_stream.length,
  isPhoneUser: user.phone_user,
  isOnline: user.connection_status === 'online',
  isLocked: user.locked,
});

const mapOpenChats = (chat) => {
  const currentUserId = Auth.userID;
  return chat.message.from_userid !== currentUserId
    ? chat.message.from_userid
    : chat.message.to_userid;
};

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
  if ((EMOJI_STATUSES.indexOf(a.emoji.status) > -1)
    && (EMOJI_STATUSES.indexOf(b.emoji.status) > -1)) {
    if (a.emoji.changedAt < b.emoji.changedAt) {
      return -1;
    } else if (a.emoji.changedAt > b.emoji.changedAt) {
      return 1;
    }

    return sortUsersByName(a, b);
  } else if (EMOJI_STATUSES.indexOf(a.emoji.status) > -1) {
    return -1;
  } else if (EMOJI_STATUSES.indexOf(b.emoji.status) > -1) {
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
    return sortUsersByName(a, b);
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

const sortChats = (a, b) => {
  let sort = sortChatsByIcon(a, b);

  if (sort === 0) {
    sort = sortChatsByName(a, b);
  }

  return sort;
};

const userFindSorting = {
  'user.set_emoji_time': 1,
  'user.role': 1,
  'user.phone_user': 1,
  'user._sort_name': 1,
  'user.userid': 1,
};

const getUsers = () => {
  const users = Users
    .find({ 'user.connection_status': 'online' }, userFindSorting)
    .fetch();

  return users
    .map(u => u.user)
    .map(mapUser)
    .sort(sortUsers);
};

const getOpenChats = (chatID) => {
  let openChats = Chat
    .find({ 'message.chat_type': PRIVATE_CHAT_TYPE })
    .fetch()
    .map(mapOpenChats);

  const currentUserId = Auth.userID;

  if (chatID) {
    openChats.push(chatID);
  }

  openChats = _.uniq(openChats);

  openChats = Users
    .find({ 'user.userid': { $in: openChats } })
    .map(u => u.user)
    .map(mapUser)
    .map((op) => {
      op.unreadCounter = UnreadMessages.count(op.id);
      return op;
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
    unreadCounter: UnreadMessages.count('public_chat_userid'),
  });

  return openChats
    .sort(sortChats);
};

getCurrentUser = () => {
  const currentUserId = Auth.userID;
  const currentUser = Users.findOne({ 'user.userid': currentUserId });

  return (currentUser) ? mapUser(currentUser.user) : null;
};

export default {
  getUsers,
  getOpenChats,
  getCurrentUser,
};
