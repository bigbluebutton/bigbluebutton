
import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import { defineMessages, injectIntl } from 'react-intl';
import _ from 'underscore';
import styles from './styles';

import Button from '/imports/ui/components/button/component';
import MessageListItem from './message-list-item/component';

const propTypes = {
  messages: PropTypes.array.isRequired,
};

const intlMessages = defineMessages({
  moreMessages: {
    id: 'app.chat.moreMessages',
    defaultMessage: 'More messages below',
    description: 'Chat message when the user has unread messages below the scroll',
  },
});

class MessageList extends Component {
  scrollTo(position) {
    const node = findDOMNode(this.refs.scrollArea);
    node.scrollTop = position || node.scrollHeight; // go bottom if position is undefined

    if (node.scrollTop !== position) {
      this.props.handleScrollUpdate(node.scrollTop);
    }
  }

  componentWillUnmount() {
    const node = findDOMNode(this.refs.scrollArea);
    this.props.handleScrollUpdate(node.scrollTop);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.chatId !== nextProps.chatId) {
      const node = findDOMNode(this.refs.scrollArea);
      this.props.handleScrollUpdate(node.scrollTop);
    }
  }

  componentWillUpdate(nextProps) {
    if (this.props.chatId !== nextProps.chatId) {
      this.shouldScrollBottom = false;
      return;
    }

    const node = findDOMNode(this.refs.scrollArea);
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
      <div className={styles.messageListWrapper}>
        <div {...this.props} ref="scrollArea" className={styles.messageList}>
          {messages.map((message, index) => (
            <MessageListItem
              handleReadMessage={this.props.handleReadMessage}
              className={styles.messageListItem}
              key={index}
              message={message.content}
              user={message.sender}
              time={message.time}
              timeLastMessage={message.timeLastMessage}
            />
          ))}
        </div>
        {this.renderUnreadNotification()}
      </div>
    );
  }

  renderUnreadNotification() {
    const { intl, hasUnreadMessages } = this.props;

    if (hasUnreadMessages) {
      return (
        <Button
          className={styles.unreadButton}
          size={'sm'}
          label={intl.formatMessage(intlMessages.moreMessages)}
          onClick={() => this.scrollTo()}
        />
      );
    }

    return null;
  }
}

MessageList.propTypes = propTypes;

export default injectIntl(MessageList);
