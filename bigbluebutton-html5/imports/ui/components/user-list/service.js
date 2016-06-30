import Users from '/imports/api/users';
import auth from '/imports/ui/services/auth';

import { callServer } from '/imports/ui/services/api';

const ROLE_MODERATOR = 'MODERATOR';
const EMOJI_STATUSES = ['raiseHand', 'happy', 'smile', 'neutral', 'sad', 'confused', 'away'];
const PRIVATE_CHAT_TYPE = 'PRIVATE_CHAT';

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
  isCurrent: user.userid === auth.getUser(),
  isVoiceUser: user.voiceUser.joined,
  isMuted: user.voiceUser.muted,
  isListenOnly: user.listenOnly,
  isSharingWebcam: user.webcam_stream.length,
  isPhoneUser: user.phone_user,
});

const mapOpenChats = chat => {
  let currentUserId = auth.getUser();
  return chat.message.from_userid !== auth.getUser()
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
    return sortUsersByName(a, b);
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
  let sort = sortUsersByEmoji(a, b);

  if (sort === 0) {
    sort = sortUsersByModerator(a, b);
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

const getOpenChats = openChat => {
  window.Users = Users;

  let openChats = Chat
  .find({ 'message.chat_type': PRIVATE_CHAT_TYPE })
  .fetch()
  .map(mapOpenChats);

  let currentUserId = auth.getUser();
  if (openChat && openChat.chatID) {
    openChats.push(openChat.chatID);
  }

  openChats = _.uniq(openChats);

  openChats = Users
  .find({ 'user.userid': { $in: openChats } })
  .map(u => u.user)
  .map(mapUser);

  openChats.push({
    id: 'public',
    name: 'Public Chat',
    icon: 'group-chat',
  });

  return openChats
  .sort(sortChats);
};

getCurrentUser = () => {
  let currentUserId = auth.getUser();

  return mapUser(
    Users
    .findOne({ 'user.userid': currentUserId })
    .user
  );
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
};

export default {
  getUsers,
  getOpenChats,
  getCurrentUser,
  userActions,
};
