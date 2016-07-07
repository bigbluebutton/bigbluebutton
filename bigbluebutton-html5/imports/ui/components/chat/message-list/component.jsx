
import React, { Component, PropTypes } from 'react';
import { findDOMscrollArea } from 'react-dom';
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
  constructor(props) {
    super(props);

    this.shouldScrollBottom = false;
    this.lastKnowScrollPosition = 0;
    this.ticking = false;

    this.handleScrollChange = this.handleScrollChange.bind(this);
  }

  scrollTo(position) {
    const { scrollArea } = this.refs;

    if (position === undefined) {
      position = scrollArea.scrollHeight - scrollArea.clientHeight;
    }

    scrollArea.scrollTop = position;
  }

  handleScrollChange(e) {
    this.lastKnowScrollPosition = e.target.scrollTop;

    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        this.props.handleScrollUpdate(this.lastKnowScrollPosition);
        this.ticking = false;
      });
    }

    this.ticking = true;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.chatId !== nextProps.chatId) {
      this.props.handleScrollUpdate(this.refs.scrollArea.scrollTop);
    }
  }

  componentWillUpdate(nextProps) {
    if (this.props.chatId !== nextProps.chatId) {
      this.shouldScrollBottom = false;
      return;
    }

    const { scrollArea } = this.refs;
    this.shouldScrollBottom = scrollArea.scrollTop + scrollArea.offsetHeight === scrollArea.scrollHeight;

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
    const { scrollArea } = this.refs;

    this.scrollTo(this.props.scrollPosition);
    scrollArea.addEventListener('scroll', this.handleScrollChange);
  }

  componentWillUnmount() {
    const { scrollArea } = this.refs;

    this.props.handleScrollUpdate(scrollArea.scrollTop);
    scrollArea.removeEventListener('scroll', this.handleScrollChange);
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
              messages={message.content}
              user={message.sender}
              time={message.time}
              chatAreaId={this.props.id}
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
