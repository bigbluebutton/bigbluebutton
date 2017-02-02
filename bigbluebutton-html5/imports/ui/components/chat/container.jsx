import React, { Component, PropTypes } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { createContainer } from 'meteor/react-meteor-data';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_KEY = CHAT_CONFIG.public_id;

import Chat from './component';
import ChatService from './service';

const intlMessages = defineMessages({
  titlePublic: {
    id: 'app.chat.titlePublic',
    defaultMessage: 'Public Chat',
    description: 'Public chat title',
  },
  titlePrivate: {
    id: 'app.chat.titlePrivate',
    defaultMessage: 'Private Chat with {name}',
    description: 'Private chat title',
  },
  partnerDisconnected: {
    id: 'app.chat.partnerDisconnected',
    defaultMessage: '{name} has left the meeting',
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

  if (messages && chatID !== PUBLIC_CHAT_KEY) {
    let userMessage = messages.find(m => m.sender !== null);
    let user = ChatService.getUser(chatID, '{{NAME}}');
    // TODO: Find out how to get the name of the user when logged out

    title = intl.formatMessage(intlMessages.titlePrivate, { name: user.name });
    chatName = user.name;

    if (user.isLoggedOut) {
      let time = Date.now();
      let id = `partner-disconnected-${time}`;
      let messagePartnerLoggedOut = {
        id: id,
        content: [{
          id: id,
          text: intl.formatMessage(intlMessages.partnerDisconnected, { name: user.name }),
          time: time,
        },],
        time: time,
        sender: null,
      };

      messages.push(messagePartnerLoggedOut);
      isChatLocked = true;
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
    isChatLocked,
    scrollPosition,
    actions: {
      handleSendMessage: message => {
        let sentMessage = ChatService.sendMessage(chatID, message);
        ChatService.updateScrollPosition(chatID, null); //null so its scrolls to bottom
        // ChatService.updateUnreadMessage(chatID, sentMessage.from_time);
      },

      handleScrollUpdate: position => ChatService.updateScrollPosition(chatID, position),

      handleReadMessage: timestamp => ChatService.updateUnreadMessage(chatID, timestamp),
    },
  };
}, ChatContainer));
