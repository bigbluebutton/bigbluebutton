
import React, { Component, PropTypes } from 'react';
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

    this.handleScrollChange = _.debounce(this.handleScrollChange.bind(this), 150);
    this.handleScrollUpdate = _.debounce(this.handleScrollUpdate.bind(this), 150);
  }

  scrollTo(position = null) {
    const { scrollArea } = this.refs;

    if (position === null) {
      position = scrollArea.scrollHeight - scrollArea.clientHeight;
    }

    scrollArea.scrollTop = position;
  }

  handleScrollUpdate(position, target) {
    if (position !== null && position + target.offsetHeight === target.scrollHeight) {
      position = null; //update with null so it keeps auto scrolling
    }

    this.props.handleScrollUpdate(position);
  }

  handleScrollChange(e) {
    this.lastKnowScrollPosition = e.target.scrollTop;

    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        let position = this.lastKnowScrollPosition;
        this.handleScrollUpdate(position, e.target);
        this.ticking = false;
      });
    }

    this.ticking = true;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.chatId !== nextProps.chatId) {
      const { scrollArea } = this.refs;
      this.handleScrollUpdate(scrollArea.scrollTop, scrollArea);
    }
  }

  componentWillUpdate(nextProps) {

    if (this.props.chatId !== nextProps.chatId) {
      this.shouldScrollBottom = false;
      return;
    }

    const { scrollArea } = this.refs;
    this.shouldScrollBottom = scrollArea.scrollTop +
                              scrollArea.offsetHeight ===
                              scrollArea.scrollHeight;

  }

  componentDidUpdate(prevProps) {
    const { scrollPosition, chatId } = this.props;

    if (this.shouldScrollBottom) {
      this.scrollTo();
    } else if (prevProps.chatId !== chatId) {
      this.scrollTo(scrollPosition);
    }
  }

  componentDidMount() {
    const { scrollArea } = this.refs;

    this.scrollTo(this.props.scrollPosition);
    scrollArea.addEventListener('scroll', this.handleScrollChange, false);
  }

  componentWillUnmount() {
    const { scrollArea } = this.refs;

    this.handleScrollUpdate(scrollArea.scrollTop, scrollArea);
    scrollArea.removeEventListener('scroll', this.handleScrollChange, false);
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.chatId !== nextProps.chatId
      || this.props.hasUnreadMessages !== nextProps.hasUnreadMessages
      || this.props.messages.length !== nextProps.messages.length
      || !_.isEqual(this.props.messages, nextProps.messages)) {
      return true;
    }

    return false;
  }

  render() {
    const { messages } = this.props;

    return (
      <div className={styles.messageListWrapper}>
        <div
          tabIndex="0"
          role="log"
          aria-atomic="true"
          aria-relevant="additions"
          ref="scrollArea"
          className={styles.messageList}
          id={this.props.id}
        >
          {messages.map((message) => (
            <MessageListItem
              handleReadMessage={this.props.handleReadMessage}
              className={styles.messageListItem}
              key={message.id}
              messages={message.content}
              user={message.sender}
              time={message.time}
              chatAreaId={this.props.id}
              lastReadMessageTime={this.props.lastReadMessageTime}
            />
          ))}
        </div>
        {this.renderUnreadNotification()}
      </div>
    );
  }

  renderUnreadNotification() {
    const { intl, hasUnreadMessages, scrollPosition } = this.props;

    if (hasUnreadMessages && scrollPosition !== null) {
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
