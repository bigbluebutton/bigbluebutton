import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import _ from 'lodash';
import Button from '/imports/ui/components/button/component';
import { styles } from './styles';
import MessageListItem from './message-list-item/component';

const propTypes = {
  messages: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const intlMessages = defineMessages({
  moreMessages: {
    id: 'app.chat.moreMessages',
    description: 'Chat message when the user has unread messages below the scroll',
  },
  emptyLogLabel: {
    id: 'app.chat.emptyLogLabel',
    description: 'aria-label used when chat log is empty',
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


  componentDidMount() {
    const { scrollArea } = this;

    this.scrollTo(this.props.scrollPosition);
    scrollArea.addEventListener('scroll', this.handleScrollChange, false);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.chatId !== nextProps.chatId) {
      const { scrollArea } = this;
      this.handleScrollUpdate(scrollArea.scrollTop, scrollArea);
    }
  }

  shouldComponentUpdate(nextProps) {
    const {
      chatId,
      hasUnreadMessages,
      partnerIsLoggedOut,
    } = this.props;

    const switchingCorrespondent = chatId !== nextProps.chatId;
    const hasNewUnreadMessages = hasUnreadMessages !== nextProps.hasUnreadMessages;

    // check if the messages include <user has left the meeting>
    const lastMessage = nextProps.messages[nextProps.messages.length - 1];
    if (lastMessage) {
      const userLeftIsDisplayed = lastMessage.id.includes('partner-disconnected');
      if (!(partnerIsLoggedOut && userLeftIsDisplayed)) return true;
    }

    if (switchingCorrespondent || hasNewUnreadMessages) return true;

    return false;
  }

  componentWillUpdate(nextProps) {
    if (this.props.chatId !== nextProps.chatId) {
      this.shouldScrollBottom = false;
      return;
    }

    const { scrollArea } = this;

    const position = scrollArea.scrollTop + scrollArea.offsetHeight;

    // Compare with <1 to account for the chance scrollArea.scrollTop is a float
    // value in some browsers.
    this.shouldScrollBottom = position === scrollArea.scrollHeight ||
      (scrollArea.scrollHeight - position < 1) ||
      nextProps.scrollPosition === null;
  }

  componentDidUpdate(prevProps) {
    const { scrollPosition, chatId } = this.props;

    if (this.shouldScrollBottom) {
      this.scrollTo();
    } else if (prevProps.chatId !== chatId) {
      this.scrollTo(scrollPosition);
    }
  }

  componentWillUnmount() {
    const { scrollArea } = this;

    this.handleScrollUpdate(scrollArea.scrollTop, scrollArea);
    scrollArea.removeEventListener('scroll', this.handleScrollChange, false);
  }

  handleScrollUpdate(position, target) {
    if (position !== null && position + target.offsetHeight === target.scrollHeight) {
      this.props.handleScrollUpdate(null);
      return;
    }

    this.props.handleScrollUpdate(position);
  }

  handleScrollChange(e) {
    this.lastKnowScrollPosition = e.target.scrollTop;

    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        const position = this.lastKnowScrollPosition;
        this.handleScrollUpdate(position, e.target);
        this.ticking = false;
      });
    }

    this.ticking = true;
  }

  scrollTo(position = null) {
    const { scrollArea } = this;

    if (position === null) {
      scrollArea.scrollTop = scrollArea.scrollHeight - scrollArea.clientHeight;
      return;
    }

    scrollArea.scrollTop = position;
  }

  renderUnreadNotification() {
    const { intl, hasUnreadMessages, scrollPosition } = this.props;

    if (hasUnreadMessages && scrollPosition !== null) {
      return (
        <Button
          aria-hidden="true"
          className={styles.unreadButton}
          size="sm"
          label={intl.formatMessage(intlMessages.moreMessages)}
          onClick={() => this.scrollTo()}
        />
      );
    }

    return null;
  }

  render() {
    const { messages, intl } = this.props;
    const isEmpty = messages.length === 0;
    return (
      <div className={styles.messageListWrapper}>
        <div
          role="log"
          ref={(ref) => { this.scrollArea = ref; }}
          id={this.props.id}
          className={styles.messageList}
          aria-live="polite"
          aria-atomic="false"
          aria-relevant="additions"
          aria-label={isEmpty ? intl.formatMessage(intlMessages.emptyLogLabel) : ''}
        >
          {messages.map(message => (
            <MessageListItem
              handleReadMessage={this.props.handleReadMessage}
              className={styles.messageListItem}
              key={message.id}
              messages={message.content}
              user={message.sender}
              time={message.time}
              chatAreaId={this.props.id}
              lastReadMessageTime={this.props.lastReadMessageTime}
              scrollArea={this.scrollArea}
            />
          ))}
        </div>
        {this.renderUnreadNotification()}
      </div>
    );
  }
}

MessageList.propTypes = propTypes;

export default injectIntl(MessageList);
