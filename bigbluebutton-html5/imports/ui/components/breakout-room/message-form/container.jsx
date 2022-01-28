import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import MessageForm from './component';
import BreakoutService from '/imports/ui/components/breakout-room/service';
import ChatService from '/imports/ui/components/chat/service';

const CHAT_CONFIG = Meteor.settings.public.chat;
const MessageFormContainer = (props) => {
  const handleSendMessage = (message) => BreakoutService.sendMessageToAllBreakouts(message);

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

export default withTracker((props) => {
  const userMessagesTooAllBreakouts = BreakoutService.getUserMessagesToAllBreakouts();

  return {
    ...props,
    userMessagesTooAllBreakouts,
  };
})(MessageFormContainer);
