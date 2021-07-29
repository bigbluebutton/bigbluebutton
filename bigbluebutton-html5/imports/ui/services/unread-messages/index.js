import { Tracker } from 'meteor/tracker';

import Storage from '/imports/ui/services/storage/session';

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

  getUnreadMessages(chatID, messages) {
    const isPublicChat = chatID === PUBLIC_GROUP_CHAT_ID;

    let unreadMessages = [];

    if (messages[chatID]) {
      const contextChat = messages[chatID];
      const unreadTimewindows = contextChat.unreadTimeWindows;
      for (const unreadTimeWindowId of unreadTimewindows) {
        unreadMessages.push(isPublicChat
          ? contextChat?.preJoinMessages[unreadTimeWindowId] || contextChat?.posJoinMessages[unreadTimeWindowId]
          : contextChat?.messageGroups[unreadTimeWindowId]);
      }
    }

    return unreadMessages;
  }
}

const UnreadTrackerSingleton = new UnreadMessagesTracker();
export default UnreadTrackerSingleton;
