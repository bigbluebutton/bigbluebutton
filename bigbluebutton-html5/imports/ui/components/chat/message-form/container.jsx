import React from 'react';
import _ from 'lodash';
import { makeCall } from '/imports/ui/services/api';
import MessageForm from './component';
import ChatService from '/imports/ui/components/chat/service';
import { layoutSelect } from '../../layout/context';

const CHAT_CONFIG = Meteor.settings.public.chat;
const START_TYPING_THROTTLE_INTERVAL = 2000;

const MessageFormContainer = (props) => {
  const idChatOpen = layoutSelect((i) => i.idChatOpen);

  const handleSendMessage = (message) => {
    ChatService.setUserSentMessage(true);
    return ChatService.sendGroupMessage(message, idChatOpen);
  };
  const startUserTyping = _.throttle(
    (chatId) => makeCall('startUserTyping', chatId),
    START_TYPING_THROTTLE_INTERVAL,
  );
  const stopUserTyping = () => makeCall('stopUserTyping');

  return (
    <MessageForm
      {...{
        startUserTyping,
        stopUserTyping,
        UnsentMessagesCollection: ChatService.UnsentMessagesCollection,
        minMessageLength: CHAT_CONFIG.min_message_length,
        maxMessageLength: CHAT_CONFIG.max_message_length,
        handleSendMessage,
        idChatOpen,
        ...props,
      }}
    />
  );
};

export default MessageFormContainer;
