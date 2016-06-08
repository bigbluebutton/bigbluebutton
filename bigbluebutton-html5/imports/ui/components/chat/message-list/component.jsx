import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import styles from './styles';

import MessageListItem from './message-list-item/component';

const propTypes = {
  messages: PropTypes.array.isRequired,
};

export default class MessageList extends Component {
  _scrollBottom() {
    const node = findDOMNode(this);
    node.scrollTop = node.scrollHeight;
  }

  componentWillUpdate() {
    const node = findDOMNode(this);
    this.shouldScrollBottom = node.scrollTop + node.offsetHeight === node.scrollHeight;
  }

  componentDidUpdate() {
    if (this.shouldScrollBottom) {
      this._scrollBottom();
    }
  }

  componentDidMount() {
    this._scrollBottom();
  }

  render() {
    const { messages } = this.props;
    return (
      <div {...this.props} className={styles.messageList}>
        {messages.map((message, index) => (
          <MessageListItem
            className={styles.messageListItem}
            key={index}
            message={message.content}
            user={message.sender}
            time={message.time}
          />
        ))}
      </div>
    );
  }
}

MessageList.propTypes = propTypes;
