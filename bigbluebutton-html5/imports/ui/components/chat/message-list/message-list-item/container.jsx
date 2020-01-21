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

  return {
    messages: mappedMessage.content,
    user: mappedMessage.sender,
    time: mappedMessage.time,
  };
})(MessageListItemContainer);
