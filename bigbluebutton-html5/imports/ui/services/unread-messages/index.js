import { Tracker } from 'meteor/tracker';

import Storage from '/imports/ui/services/storage/session';
import Auth from '/imports/ui/services/auth';
import GroupChat from '/imports/api/group-chat';
import { GroupChatMsg } from '/imports/api/group-chat-msg';

const CHAT_CONFIG = Meteor.settings.public.chat;
const STORAGE_KEY = CHAT_CONFIG.storage_key;
const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;

class UnreadMessagesTracker {
  constructor() {
    this._tracker = new Tracker.Dependency();
    this._unreadChats = {
      ...Storage.getItem('UNREAD_CHATS'),
      [PUBLIC_GROUP_CHAT_ID]: (new Date()).getTime(),
    };
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
      timestamp: {
        $gt: this.get(chatID),
      },
      sender: { $ne: Auth.userID },
    };
    if (chatID === PUBLIC_GROUP_CHAT_ID) {
      filter.chatId = { $eq: chatID };
    } else {
      const privateChat = GroupChat.findOne({ users: { $all: [chatID, Auth.userID] } },
        { fields: { chatId: 1 } });

      filter.chatId = { $ne: PUBLIC_GROUP_CHAT_ID };

      if (privateChat) {
        filter.chatId = privateChat.chatId;
      }
    }
    const messages = GroupChatMsg.find(filter).fetch();
    return messages;
  }

  count(chatID) {
    const messages = this.getUnreadMessages(chatID);
    return messages.length;
  }
}

const UnreadTrackerSingleton = new UnreadMessagesTracker();
export default UnreadTrackerSingleton;
