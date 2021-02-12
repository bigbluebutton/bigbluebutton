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

  return {
    messages,
    user: mappedMessage.sender,
    time: mappedMessage.time,
    isDefaultPoll: (pollText) => {
      const pollValue = pollText.replace(/<br\/>|[ :|%\n\d+]/g, '');
      switch (pollValue) {
        case 'A': case 'AB': case 'ABC': case 'ABCD':
        case 'ABCDE': case 'YesNo': case 'TrueFalse':
          return true;
        default:
          return false;
      }
    },
  };
})(MessageListItemContainer);
