import React, { PureComponent } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import TimeWindowChatItem from './component';
import ChatLogger from '/imports/ui/components/chat/chat-logger/ChatLogger';
import ChatService from '../../service';

const CHAT_CONFIG = Meteor.settings.public.chat;
const SYSTEM_CHAT_TYPE = CHAT_CONFIG.type_system;

const isDefaultPoll = (pollText) => {
  const pollValue = pollText.replace(/<br\/>|[ :|%\n\d+]/g, '');
  switch (pollValue) {
    case 'A': case 'AB': case 'ABC': case 'ABCD':
    case 'ABCDE': case 'YesNo': case 'TrueFalse':
      return true;
    default:
      return false;
  }
};
export default class TimeWindowChatItemContainer extends PureComponent {
  render() {
    ChatLogger.debug('TimeWindowChatItemContainer::render', { ...this.props });
    const messages = this.props.message.content;

    const user = this.props.message.sender;
    const messageKey = this.props.message.key;
    const time = this.props.message.time;

    return (
      <TimeWindowChatItem
        {
        ...{
          read: this.props.message.read,
          messages,
          isDefaultPoll,
          user,
          time,
          systemMessage: this.props.messageId.startsWith(SYSTEM_CHAT_TYPE) || !user,
          messageKey,
          handleReadMessage: ChatService.updateUnreadMessage,
          ...this.props,
        }
        }
      />
    );
  }
}
