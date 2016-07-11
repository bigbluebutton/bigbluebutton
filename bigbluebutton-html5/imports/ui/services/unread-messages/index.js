import Storage from '/imports/ui/services/storage/session';
import Auth from '/imports/ui/services/auth';
import Chats from '/imports/api/chat';

const PUBLIC_CHAT_USERID = 'public_chat_userid';
const STORAGE_KEY = 'UNREAD_CHATS';

class UnreadMessagesTracker {
  constructor() {
    this._unreadChats = Storage.getItem('UNREAD_CHATS');
  }

  get(chatID) {
    return this._unreadChats[chatID] || 0;
  }

  update(chatID, timestamp = 0) {
    let currentValue = this._unreadChats[chatID];
    if (currentValue < timestamp) {
      this._unreadChats[chatID] = timestamp;
      Storage.setItem(STORAGE_KEY, this._unreadChats);
    }

    return this._unreadChats[chatID];
  }

  count(chatID) {
    let filter = {
      'message.from_time': {
        $gt: this.get(chatID),
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
  }
};

let UnreadTrackerSingleton = new UnreadMessagesTracker();
export default UnreadTrackerSingleton;
