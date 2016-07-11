import Storage from '/imports/ui/services/storage/session';
import Auth from '/imports/ui/services/auth';
import Chats from '/imports/api/chat';

const PUBLIC_CHAT_USERID = 'public_chat_userid';
const STORAGE_KEY = 'UNREAD_CHATS';

const get = (chatID) => {
  const unreadChats = Storage.getItem(STORAGE_KEY) || {};
  return unreadChats[chatID] || 0;
};

const update = (chatID, timestamp = 0) => {
  const unreadChats = Storage.getItem(STORAGE_KEY) || {};

  if ((unreadChats[chatID] || 0) < timestamp) {
    unreadChats[chatID] = timestamp;
    Storage.setItem(STORAGE_KEY, unreadChats);
  }

  return unreadChats[chatID];
};

const count = (chatID) => {
  let filter = {
    'message.from_time': {
      $gt: get(chatID),
    },
    'message.from_userid': { $ne: Auth.userID },
  };

  // Minimongo does not support $eq. See https://github.com/meteor/meteor/issues/4142
  if (chatID === PUBLIC_CHAT_USERID) {
    filter['message.to_userid'] = { $not: { $ne: chatID } };
  } else {
    filter['message.to_userid'] = { $not: { $ne: Auth.userID } };
    filter['message.from_userid'].$not = { $ne: chatID };
  }

  return Chats.find(filter).count();
};

export default {
  get,
  count,
  update,
};
