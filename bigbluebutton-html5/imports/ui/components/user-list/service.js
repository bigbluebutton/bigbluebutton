import Users from '/imports/api/users';
import Chat from '/imports/api/chat';
import Auth from '/imports/ui/services/auth';
import UnreadMessages from '/imports/ui/services/unread-messages';
import { EMOJI_STATUSES } from '/imports/utils/statuses.js';

import { callServer } from '/imports/ui/services/api';

const CHAT_CONFIG = Meteor.settings.public.chat;
const USER_CONFIG = Meteor.settings.public.user;
const ROLE_MODERATOR = USER_CONFIG.role_moderator;
const PRIVATE_CHAT_TYPE = CHAT_CONFIG.type_private;

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
  isLoggedOut: !user ? true : false,
});

const mapOpenChats = chat => {
  let currentUserId = Auth.userID;
  return chat.message.from_userid !== Auth.userID
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
  let users = Users
  .find({}, userFindSorting)
  .fetch();

  return users
    .map(u => u.user)
    .map(mapUser)
    .sort(sortUsers);
};

const getOpenChats = chatID => {
  window.Users = Users;

  let openChats = Chat
  .find({ 'message.chat_type': PRIVATE_CHAT_TYPE })
  .fetch()
  .map(mapOpenChats);

  let currentUserId = Auth.userID;
  if (chatID) {
    openChats.push(chatID);
  }

  openChats = _.uniq(openChats);

  openChats = Users
  .find({ 'user.userid': { $in: openChats } })
  .map(u => u.user)
  .map(mapUser)
  .map(op => {
    op.unreadCounter = UnreadMessages.count(op.id);
    return op;
  });

  openChats.push({
    id: 'public',
    name: 'Public Chat',
    icon: 'group-chat',
    unreadCounter: UnreadMessages.count('public_chat_userid'),
  });

  return openChats
  .sort(sortChats);
};

getCurrentUser = () => {
  let currentUserId = Auth.userID;
  let currentUser = Users.findOne({ 'user.userid': currentUserId });

  return (currentUser) ? mapUser(currentUser.user) : null;
};

const userActions = {
  openChat: {
    label: 'Chat',
    handler: (router, user) => router.push(`/users/chat/${user.id}`),
    icon: 'chat',
  },
  clearStatus: {
    label: 'Clear Status',
    handler: user => console.log('missing clear status', user),
    icon: 'clear-status',
  },
  setPresenter: {
    label: 'Make Presenter',
    handler: user => callServer('setUserPresenter', user.userid, user.name),
    icon: 'presentation',
  },
  promote: {
    label: 'Promote',
    handler: user => console.log('missing promote', user),
    icon: 'promote',
  },
  kick: {
    label: 'Kick User',
    handler: user => callServer('kickUser', user.userid),
    icon: 'kick-user',
  },
  mute: {
    label: 'Mute Audio',
    handler: user=> callServer('muteUser', Auth.userID),
    icon: 'mute',
  },
  unmute: {
    label: 'Unmute Audio',
    handler: user=> callServer('unmuteUser', Auth.userID),
    icon: 'unmute',
  },
};

export default {
  getUsers,
  getOpenChats,
  getCurrentUser,
  userActions,
};
