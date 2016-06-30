import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import _ from 'underscore';
import styles from './styles';

import MessageListItem from './message-list-item/component';

const propTypes = {
  messages: PropTypes.array.isRequired,
};

export default class MessageList extends Component {
  scrollTo(position) {
    const node = findDOMNode(this);
    node.scrollTop = position || node.scrollHeight; // go bottom if position is undefined

    if (node.scrollTop !== position) {
      this.props.handleScrollUpdate(node.scrollTop);
    }
  }

  componentWillUnmount() {
    const node = findDOMNode(this);
    this.props.handleScrollUpdate(node.scrollTop);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.chatId !== nextProps.chatId) {
      const node = findDOMNode(this);
      this.props.handleScrollUpdate(node.scrollTop);
    }
  }

  componentWillUpdate(nextProps) {
    if (this.props.chatId !== nextProps.chatId) {
      this.shouldScrollBottom = false;
      return;
    }

    const node = findDOMNode(this);
    this.shouldScrollBottom = node.scrollTop + node.offsetHeight === node.scrollHeight;

    const d = document;
    const isDocumentHidden = d.hidden || d.mozHidden || d.msHidden || d.webkitHidden;
    if (isDocumentHidden) {
      this.shouldScrollBottom = false;
      return;
    }
  }

  componentDidUpdate() {
    const { scrollPosition } = this.props;
    if (this.shouldScrollBottom) {
      this.scrollTo();
    } else {
      this.scrollTo(scrollPosition);
    }
  }

  componentDidMount() {
    this.scrollTo(this.props.scrollPosition);
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
