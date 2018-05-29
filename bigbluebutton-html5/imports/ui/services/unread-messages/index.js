import { Tracker } from 'meteor/tracker';

import Storage from '/imports/ui/services/storage/session';
import Auth from '/imports/ui/services/auth';
import Chats from '/imports/api/chat';
import ChatService from '/imports/ui/components/chat/service';

const CHAT_CONFIG = Meteor.settings.public.chat;
const STORAGE_KEY = CHAT_CONFIG.storage_key;
const PUBLIC_CHAT_USERID = CHAT_CONFIG.public_userid;

class UnreadMessagesTracker {
  constructor() {
    this._tracker = new Tracker.Dependency();
    this._unreadChats = Storage.getItem('UNREAD_CHATS') || { [PUBLIC_CHAT_USERID]: (new Date()).getTime() };
    this.get = this.get.bind(this);
  }

  get(chatID) {
    this._tracker.depend();
    return this._unreadChats[chatID] || 0;
  }

  update(chatID, timestamp = 0) {
    const currentValue = this.get(chatID);
    if (currentValue < timestamp) {
      this._unreadChats[chatID] = timestamp;
      this._tracker.changed();
      Storage.setItem(STORAGE_KEY, this._unreadChats);
    }

    return this._unreadChats[chatID];
  }

  getUnreadMessages(chatID) {
    const filter = {
      fromTime: {
        $gt: this.get(chatID),
      },
      fromUserId: { $ne: Auth.userID },
    };
    // Minimongo does not support $eq. See https://github.com/meteor/meteor/issues/4142
    if (chatID === PUBLIC_CHAT_USERID) {
      filter.toUserId = { $not: { $ne: chatID } };
    } else {
      filter.toUserId = { $not: { $ne: Auth.userID } };
      filter.fromUserId.$not = { $ne: chatID };
    }
    const messages = Chats.find(filter).fetch();
    return messages;
  }

  count(chatID) {
    const messages = this.getUnreadMessages(chatID);
    const reducedAndMappedMessages = ChatService.reduceAndMapMessages(messages);
    return reducedAndMappedMessages.length;
  }
}

const UnreadTrackerSingleton = new UnreadMessagesTracker();
export default UnreadTrackerSingleton;
