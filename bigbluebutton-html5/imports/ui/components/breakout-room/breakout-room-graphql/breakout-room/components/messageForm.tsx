import { useMutation } from '@apollo/client';
import React from 'react';
import { BREAKOUT_ROOM_SEND_MESSAGE_TO_ALL } from '../../../mutations';
import Styled from '../styles';

const CHAT_CONFIG = window.meetingClientSettings.public.chat;
const minMessageLength = CHAT_CONFIG.min_message_length;
const maxMessageLength = CHAT_CONFIG.max_message_length;

const BreakoutMessageForm: React.FC = () => {
  const [sendMessageToAllBreakouts] = useMutation(BREAKOUT_ROOM_SEND_MESSAGE_TO_ALL);

  const handleSendMessage = (message: string) => {
    sendMessageToAllBreakouts({
      variables: {
        message,
      },
    });
  };

  return (
    <Styled.Form
        ref={(ref) => { this.form = ref; }}
        onSubmit={this.handleSubmit}
    >
      
    </Styled.Form>
  );
};

const BreakoutMessageFormContainer: React.FC = () => {
  return (
    <BreakoutMessageForm />
  );
};

export default BreakoutMessageFormContainer;
