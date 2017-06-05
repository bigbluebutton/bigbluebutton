import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { createContainer } from 'meteor/react-meteor-data';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_KEY = CHAT_CONFIG.public_id;

import Chat from './component';
import ChatService from './service';

const intlMessages = defineMessages({
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

class ChatContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Chat {...this.props}>
        {this.props.children}
      </Chat>
    );
  }
}

export default injectIntl(createContainer(({ params, intl }) => {
  const chatID = params.chatID || PUBLIC_CHAT_KEY;

  let messages = [];
  let isChatLocked = ChatService.isChatLocked(chatID);
  let title = intl.formatMessage(intlMessages.titlePublic);
  let chatName = title;

  if (chatID === PUBLIC_CHAT_KEY) {
    messages = ChatService.getPublicMessages();
  } else {
    messages = ChatService.getPrivateMessages(chatID);
  }

  const user = ChatService.getUser(chatID, '{{NAME}}');

  let partnerIsLoggedOut = false;

  if (user) {
    partnerIsLoggedOut = !user.isOnline;

    if (messages && chatID !== PUBLIC_CHAT_KEY) {
      const userMessage = messages.find(m => m.sender !== null);
      const user = ChatService.getUser(chatID, '{{NAME}}');

      title = intl.formatMessage(intlMessages.titlePrivate, { 0: user.name });
      chatName = user.name;

      if (!user.isOnline) {
        const time = Date.now();
        const id = `partner-disconnected-${time}`;
        const messagePartnerLoggedOut = {
          id,
          content: [{
            id,
            text: intl.formatMessage(intlMessages.partnerDisconnected, { 0: user.name }),
            time,
          }],
          time,
          sender: null,
        };

        messages.push(messagePartnerLoggedOut);
        isChatLocked = true;
      }
    }
  }

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
    actions: {
      handleClosePrivateChat: chatID => ChatService.closePrivateChat(chatID),

      handleSendMessage: (message) => {
        ChatService.updateScrollPosition(chatID, null);
        return ChatService.sendMessage(chatID, message);
      },

      handleScrollUpdate: position => ChatService.updateScrollPosition(chatID, position),

      handleReadMessage: timestamp => ChatService.updateUnreadMessage(chatID, timestamp),
    },
  };
}, ChatContainer));
