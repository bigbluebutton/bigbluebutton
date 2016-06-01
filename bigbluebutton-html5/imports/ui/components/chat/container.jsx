import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import Chat from './component';
import ChatService from './service';

const PUBLIC_CHAT_KEY = 'public';

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

export default createContainer(({ params }) => {
  const chatID = params.chatID || PUBLIC_CHAT_KEY;

  let messages = [];

  if (chatID === PUBLIC_CHAT_KEY) {
    title = 'Public Chat';
    messages = ChatService.getPublicMessages();
  } else {
    title = 'Username';
    messages = ChatService.getPrivateMessages(chatID);
  }

  return {
    title,
    messages,
  };
}, ChatContainer);
