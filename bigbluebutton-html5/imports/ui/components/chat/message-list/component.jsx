import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import _ from 'lodash';
import fastdom from 'fastdom';
import Button from '/imports/ui/components/button/component';
import { styles } from './styles';
import MessageListItem from './message-list-item/component';

const propTypes = {
  messages: PropTypes.arrayOf(PropTypes.object).isRequired,
  scrollPosition: PropTypes.number,
  chatId: PropTypes.string.isRequired,
  hasUnreadMessages: PropTypes.bool.isRequired,
  partnerIsLoggedOut: PropTypes.bool.isRequired,
  handleScrollUpdate: PropTypes.func.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  id: PropTypes.string.isRequired,
  lastReadMessageTime: PropTypes.number,
  handleReadMessage: PropTypes.func.isRequired,
};

const defaultProps = {
  scrollPosition: null,
  lastReadMessageTime: 0,
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

    this.state = {};
  }


  componentDidMount() {
    const {
      scrollPosition,
    } = this.props;

    const { scrollArea } = this;

    this.setState({
      scrollArea,
    });

    this.scrollTo(scrollPosition);
    scrollArea.addEventListener('scroll', this.handleScrollChange, false);
  }

  componentWillReceiveProps(nextProps) {
    const {
      chatId,
    } = this.props;

    if (chatId !== nextProps.chatId) {
      const { scrollArea } = this;
      this.handleScrollUpdate(scrollArea.scrollTop, scrollArea);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {
      chatId,
      hasUnreadMessages,
      partnerIsLoggedOut,
    } = this.props;

    const {
      scrollArea,
    } = this.state;

    if (!scrollArea && nextState.scrollArea) return true;

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
    const {
      chatId,
    } = this.props;

    if (chatId !== nextProps.chatId) {
      this.shouldScrollBottom = false;
      return;
    }

    const { scrollArea } = this;

    const position = scrollArea.scrollTop + scrollArea.offsetHeight;

    // Compare with <1 to account for the chance scrollArea.scrollTop is a float
    // value in some browsers.
    this.shouldScrollBottom = nextProps.scrollPosition === null
      || position === scrollArea.scrollHeight
      || (scrollArea.scrollHeight - position < 1);
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
    const {
      handleScrollUpdate,
    } = this.props;

    if (position !== null && position + target.offsetHeight === target.scrollHeight) {
      handleScrollUpdate(null);
      return;
    }

    handleScrollUpdate(position);
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
      fastdom.measure(() => {
        const {
          scrollHeight,
          clientHeight,
        } = scrollArea;

        fastdom.mutate(() => {
          scrollArea.scrollTop = scrollHeight - clientHeight;
        });
      });

      return;
    }

    fastdom.mutate(() => {
      scrollArea.scrollTop = position;
    });
  }

  renderUnreadNotification() {
    const { intl, hasUnreadMessages, scrollPosition } = this.props;

    if (hasUnreadMessages && scrollPosition !== null) {
      return (
        <Button
          aria-hidden="true"
          className={styles.unreadButton}
          color="primary"
          size="sm"
          label={intl.formatMessage(intlMessages.moreMessages)}
          onClick={() => this.scrollTo()}
        />
      );
    }

    return null;
  }

  render() {
    const {
      messages, intl, id, lastReadMessageTime, handleReadMessage,
    } = this.props;

    const {
      scrollArea,
    } = this.state;

    const isEmpty = messages.length === 0;
    return (
      <div className={styles.messageListWrapper}>
        <div
          role="log"
          ref={(ref) => { if (ref != null) { this.scrollArea = ref; } }}
          id={id}
          className={styles.messageList}
          aria-live="polite"
          aria-atomic="false"
          aria-relevant="additions"
          aria-label={isEmpty ? intl.formatMessage(intlMessages.emptyLogLabel) : ''}
        >
          {messages.map(message => (
            <MessageListItem
              handleReadMessage={handleReadMessage}
              key={message.id}
              messages={message.content}
              user={message.sender}
              time={message.time}
              chatAreaId={id}
              lastReadMessageTime={lastReadMessageTime}
              scrollArea={scrollArea}
            />
          ))}
        </div>
        {this.renderUnreadNotification()}
      </div>
    );
  }
}

MessageList.propTypes = propTypes;
MessageList.defaultProps = defaultProps;

export default injectIntl(MessageList);
