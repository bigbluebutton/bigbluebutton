import React from 'react';
import { useMutation } from '@apollo/client';
import MessageForm from './component';
import ChatService from '/imports/ui/components/chat/service';
import { BREAKOUT_ROOM_SEND_MESSAGE_TO_ALL } from '../mutations';

const CHAT_CONFIG = window.meetingClientSettings.public.chat;
const MessageFormContainer = (props) => {
  const [sendMessageToAllBreakouts] = useMutation(BREAKOUT_ROOM_SEND_MESSAGE_TO_ALL);

  const handleSendMessage = (message) => {
    sendMessageToAllBreakouts({
      variables: {
        message,
      },
    });
  };

  return (
    <MessageForm
      {...{
        minMessageLength: CHAT_CONFIG.min_message_length,
        maxMessageLength: CHAT_CONFIG.max_message_length,
        UnsentMessagesCollection: ChatService.UnsentMessagesCollection,
        handleSendMessage,
        ...props,
      }}
    />
  );
};

export default MessageFormContainer;
