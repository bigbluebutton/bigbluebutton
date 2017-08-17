import Users from '/imports/api/2.0/users';
import Chat from '/imports/api/2.0/chat';
import Auth from '/imports/ui/services/auth';
import UnreadMessages from '/imports/ui/services/unread-messages';
import Storage from '/imports/ui/services/storage/session';
import mapUser from '/imports/ui/services/user/mapUser';
import { EMOJI_STATUSES } from '/imports/utils/statuses';
import _ from 'lodash';

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
  emojiTime: 1,
  role: 1,
  phoneUser: 1,
  sortName: 1,
  userId: 1,
};

const getUsers = () => {
  const users = Users
    .find({ connectionStatus: 'online' }, userFindSorting)
    .fetch();

  return users
    .map(mapUser)
    .sort(sortUsers);
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

const getCurrentUser = () => {
  const currentUserId = Auth.userID;
  const currentUser = Users.findOne({ userId: currentUserId });

  return (currentUser) ? mapUser(currentUser) : null;
};

export default {
  getUsers,
  getOpenChats,
  getCurrentUser,
};
