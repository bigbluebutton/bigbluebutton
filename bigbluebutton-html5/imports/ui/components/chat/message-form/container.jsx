import React, { PureComponent } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { makeCall } from '/imports/ui/services/api';
import ChatForm from './component';
import Auth from '/imports/ui/services/auth';
import ChatService from '../service';
import Meetings from '/imports/api/meetings';

const CHAT_CONFIG = Meteor.settings.public.chat;

class ChatContainer extends PureComponent {
  render() {
    return (
      <ChatForm {...this.props} />
    );
  }
}

export default withTracker(() => {
  const cleanScrollAndSendMessage = (message) => {
    ChatService.updateScrollPosition(null);
    return ChatService.sendGroupMessage({message: message});
  };

  const startUserTyping = chatId => makeCall('startUserTyping', chatId);

  const stopUserTyping = () => makeCall('stopUserTyping');

  let meetingTitle;
  const meetingId = Auth.meetingID;
  const meetingObject = Meetings.findOne({
    meetingId,
  }, { fields: { 'meetingProp.name': 1, 'breakoutProps.sequence': 1 } });
  meetingTitle = meetingObject.meetingProp.name;

  return {
    startUserTyping,
    stopUserTyping,
    UnsentMessagesCollection: ChatService.UnsentMessagesCollection,
    minMessageLength: CHAT_CONFIG.min_message_length,
    maxMessageLength: CHAT_CONFIG.max_message_length,
    handleSendMessage: cleanScrollAndSendMessage,
    RoomName: meetingTitle,
  };
})(ChatContainer);
