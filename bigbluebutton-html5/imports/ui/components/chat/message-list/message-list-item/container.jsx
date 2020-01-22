import React, { PureComponent } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import MessageListItem from './component';
import ChatService from '../../service';

class MessageListItemContainer extends PureComponent {
  render() {
    return (
      <MessageListItem {...this.props} />
    );
  }
}

export default withTracker(({ message }) => {
  const mappedMessage = ChatService.mapGroupMessage(message);
  const messages = mappedMessage.content;

  const chats = [];
  const polls = [];

  if (messages.length > 0) {
    messages.forEach((m) => {
      if (m.text.includes('<br/>')) {
        polls.push(m);
      } else {
        chats.push(m);
      }
    });
  }

  return {
    messages,
    user: mappedMessage.sender,
    time: mappedMessage.time,
    chats,
    polls,
  };
})(MessageListItemContainer);
