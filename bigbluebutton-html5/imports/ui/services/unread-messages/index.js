import Storage from '/imports/ui/services/storage/session';
import Chats from '/imports/api/chat';

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

const count = (chatID) => Chats.find({
    'message.from_time': {
      $gt: get(chatID),
    },
    $or: [
      { 'message.to_userid': chatID },
      { 'message.from_userid': chatID },
    ],
  }).count();

export default {
  count,
  update,
};
