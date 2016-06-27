import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import _ from 'underscore';
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

  componentWillUpdate(nextProps) {
    const node = findDOMNode(this);
    this.shouldScrollBottom = node.scrollTop + node.offsetHeight === node.scrollHeight;

    const d = document;
    const isDocumentHidden = d.hidden || d.mozHidden || d.msHidden || d.webkitHidden;
    if (isDocumentHidden) {
      this.shouldScrollBottom = false;
    }

    const lastMessage = _.last(nextProps.messages);
    if (lastMessage.sender.isCurrent) {
      this.shouldScrollBottom = true;
    }
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
