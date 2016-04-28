import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import Chat from './Chat.jsx';

class ChatContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentChat: null,
    }
  }

  componentDidMount() {
    const chatID = this.props.params.id || 'public';
    this.setState({ currentChat: chatID });
  }

  render() {
    const { chatID } = this.props.params;
    return (
      <Chat currentChat={chatID}>
        {this.props.children}
      </Chat>
    );
  }
}

export default createContainer(() => {
  return {};
}, ChatContainer);
