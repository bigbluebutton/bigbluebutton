Template.makeButton.helpers({
  hasGotUnreadMail(userId) {
    let chats, i, j, len, len1, tabs;
    chats = getInSession('chats');
    if (chats !== void 0) {
      if (userId === 'all_chats') {
        for (i = 0, len = chats.length; i < len; i++) {
          tabs = chats[i];
          if (tabs.gotMail === true) {
            return true;
          }
        }
      } else if (userId === 'PUBLIC_CHAT') {
        for (j = 0, len1 = chats.length; j < len1; j++) {
          tabs = chats[j];
          if (tabs.userId === userId && tabs.gotMail === true) {
            return true;
          }
        }
      }
    }

    return false;
  },

  getNumberOfUnreadMessages(userId) {
    let chat, chats, i, len;
    if (userId === 'all_chats') {
      return;
    } else {
      chats = getInSession('chats');
      if (chats !== void 0) {
        for (i = 0, len = chats.length; i < len; i++) {
          chat = chats[i];
          if (chat.userId === userId && chat.gotMail) {
            if (chat.number > 9) {
              return '9+';
            } else {
              return chat.number;
            }
          }
        }
      }
    }
  },

  getNotificationClass(userId) {
    if (userId === 'all_chats') {
      return 'unreadChat';
    }

    if (userId === 'PUBLIC_CHAT') {
      return 'unreadChatNumber';
    }
  },
});
