import React, { PureComponent } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { withTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import Auth from '/imports/ui/services/auth';
import Chat from './component';
import ChatService from './service';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_KEY = CHAT_CONFIG.public_id;
const CHAT_CLEAR = CHAT_CONFIG.system_messages_keys.chat_clear;

const intlMessages = defineMessages({
  [CHAT_CLEAR]: {
    id: 'app.chat.clearPublicChatMessage',
    description: 'message of when clear the public chat',
  },
  titlePublic: {
    id: 'app.chat.titlePublic',
    description: 'Public chat title',
  },
  titlePrivate: {
    id: 'app.chat.titlePrivate',
    description: 'Private chat title',
  },
  partnerDisconnected: {
    id: 'app.chat.partnerDisconnected',
    description: 'System chat message when the private chat partnet disconnect from the meeting',
  },
});

class ChatContainer extends PureComponent {
  componentDidMount() {
    // in case of reopening a chat, need to make sure it's removed from closed list
    ChatService.removeFromClosedChatsSession();
  }

  render() {
    return (
      <Chat {...this.props}>
        {this.props.children}
      </Chat>
    );
  }
}

export default injectIntl(withTracker(({ intl }) => {
  const chatID = Session.get('idChatOpen') || PUBLIC_CHAT_KEY;
  let messages = [];
  let isChatLocked = ChatService.isChatLocked(chatID);
  let title = intl.formatMessage(intlMessages.titlePublic);
  let chatName = title;
  let partnerIsLoggedOut = false;
  let systemMessageIntl = {};

  if (chatID === PUBLIC_CHAT_KEY) {
    const { welcomeProp } = ChatService.getMeeting();
    const user = ChatService.getUser(Auth.userID);

    messages = ChatService.getPublicGroupMessages();

    const time = user.loginTime;
    const welcomeId = `welcome-msg-${time}`;

    const welcomeMsg = {
      id: welcomeId,
      content: [{
        id: welcomeId,
        text: welcomeProp.welcomeMsg,
        time,
      }],
      time,
      sender: null,
    };

    const moderatorTime = time + 1;
    const moderatorId = `moderator-msg-${moderatorTime}`;

    const moderatorMsg = {
      id: moderatorId,
      content: [{
        id: moderatorId,
        text: welcomeProp.modOnlyMessage,
        time: moderatorTime,
      }],
      time: moderatorTime,
      sender: null,
    };

    const messagesBeforeWelcomeMsg =
      ChatService.reduceAndMapGroupMessages(messages.filter(message => message.timestamp < time));
    const messagesAfterWelcomeMsg =
      ChatService.reduceAndMapGroupMessages(messages.filter(message => message.timestamp >= time));

    const clearMessage = messages.filter(message => message.message === 'PUBLIC_CHAT_CLEAR');

    const hasClearMessage = clearMessage.length;

    const showWelcomeMsg =
      (hasClearMessage && clearMessage[0].timestamp < time) || !hasClearMessage;

    const showModeratorMsg =
      (user.isModerator)
      && ((hasClearMessage && clearMessage[0].timestamp < moderatorTime) || !hasClearMessage);

    const messagesFormated = messagesBeforeWelcomeMsg
      .concat(showWelcomeMsg ? welcomeMsg : [])
      .concat(showModeratorMsg ? moderatorMsg : [])
      .concat(messagesAfterWelcomeMsg);

    messages = messagesFormated.sort((a, b) => (a.time - b.time));
  } else {
    messages = ChatService.getPrivateGroupMessages();

    const user = ChatService.getUser(chatID);
    chatName = user.name;
    systemMessageIntl = { 0: user.name };
    title = intl.formatMessage(intlMessages.titlePrivate, systemMessageIntl);
    partnerIsLoggedOut = !user.isOnline;

    if (partnerIsLoggedOut) {
      const time = Date.now();
      const id = `partner-disconnected-${time}`;
      const messagePartnerLoggedOut = {
        id,
        content: [{
          id,
          text: 'partnerDisconnected',
          time,
        }],
        time,
        sender: null,
      };

      messages.push(messagePartnerLoggedOut);
      isChatLocked = true;
    }
  }

  messages = messages.map((message) => {
    if (message.sender) return message;

    return {
      ...message,
      content: message.content.map(content => ({
        ...content,
        text: content.text in intlMessages ?
          `<b><i>${intl.formatMessage(intlMessages[content.text], systemMessageIntl)}</i></b>` : content.text,
      })),
    };
  });


  const scrollPosition = ChatService.getScrollPosition(chatID);
  const hasUnreadMessages = ChatService.hasUnreadMessages(chatID);
  const lastReadMessageTime = ChatService.lastReadMessageTime(chatID);

  return {
    chatID,
    chatName,
    title,
    messages,
    lastReadMessageTime,
    hasUnreadMessages,
    partnerIsLoggedOut,
    isChatLocked,
    scrollPosition,
    minMessageLength: CHAT_CONFIG.min_message_length,
    maxMessageLength: CHAT_CONFIG.max_message_length,
    UnsentMessagesCollection: ChatService.UnsentMessagesCollection,
    actions: {
      handleClosePrivateChat: chatId => ChatService.closePrivateChat(chatId),

      handleSendMessage: (message) => {
        ChatService.updateScrollPosition(null);
        return ChatService.sendGroupMessage(message);
      },

      handleScrollUpdate: position => ChatService.updateScrollPosition(position),

      handleReadMessage: timestamp => ChatService.updateUnreadMessage(timestamp),
    },
  };
})(ChatContainer));
