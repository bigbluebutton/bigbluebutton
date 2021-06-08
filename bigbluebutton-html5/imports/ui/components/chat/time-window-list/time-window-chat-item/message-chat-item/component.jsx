import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import fastdom from 'fastdom';
import { injectIntl } from 'react-intl';
import ChatLogger from '/imports/ui/components/chat/chat-logger/ChatLogger';

const propTypes = {
  text: PropTypes.string.isRequired,
  time: PropTypes.number.isRequired,
  lastReadMessageTime: PropTypes.number,
  handleReadMessage: PropTypes.func.isRequired,
  scrollArea: PropTypes.instanceOf(Element),
  className: PropTypes.string.isRequired,
};

const defaultProps = {
  lastReadMessageTime: 0,
  scrollArea: undefined,
};

const eventsToBeBound = [
  'scroll',
  'resize',
];

const isElementInViewport = (el) => {
  if (!el) return false;
  const rect = el.getBoundingClientRect();

  return (
    rect.top >= 0
    // This condition is for large messages that are bigger than client height
    || rect.top + rect.height >= 0
  );
};

class MessageChatItem extends PureComponent {
  constructor(props) {
    super(props);

    this.ticking = false;

    this.handleMessageInViewport = _.debounce(this.handleMessageInViewport.bind(this), 50);
  }

  componentDidMount() {
    this.listenToUnreadMessages();
  }

  componentDidUpdate(prevProps, prevState) {
    ChatLogger.debug('MessageChatItem::componentDidUpdate::props', { ...this.props }, { ...prevProps });
    ChatLogger.debug('MessageChatItem::componentDidUpdate::state', { ...this.state }, { ...prevState });
    this.listenToUnreadMessages();
  }

  componentWillUnmount() {
    // This was added 3 years ago, but never worked. Leaving it around in case someone returns
    // and decides it needs to be fixed like the one in listenToUnreadMessages()
    // if (!lastReadMessageTime > time) {
    //  return;
    // }
    ChatLogger.debug('MessageChatItem::componentWillUnmount', this.props);
    this.removeScrollListeners();
  }

  addScrollListeners() {
    const {
      scrollArea,
    } = this.props;

    if (scrollArea) {
      eventsToBeBound.forEach(
        e => scrollArea.addEventListener(e, this.handleMessageInViewport),
      );
    }
  }

  handleMessageInViewport() {
    if (!this.ticking) {
      fastdom.measure(() => {
        const node = this.text;
        const {
          handleReadMessage,
          time,
          read,
        } = this.props;

        if (read) {
          this.removeScrollListeners();
          return;
        }

        if (isElementInViewport(node)) {
          handleReadMessage(time);
          this.removeScrollListeners();
        }

        this.ticking = false;
      });
    }

    this.ticking = true;
  }

  removeScrollListeners() {
    const {
      scrollArea,
      read,
    } = this.props;

    if (scrollArea && !read) {
      eventsToBeBound.forEach(
        e => scrollArea.removeEventListener(e, this.handleMessageInViewport),
      );
    }
  }

  // depending on whether the message is in viewport or not,
  // either read it or attach a listener
  listenToUnreadMessages() {
    const {
      handleReadMessage,
      time,
      read,
    } = this.props;

    if (read) {
      return;
    }

    const node = this.text;

    fastdom.measure(() => {
      const {
        read: newRead,
      } = this.props;
      // this function is called after so we need to get the updated lastReadMessageTime

      if (newRead) {
        return;
      }

      if (isElementInViewport(node)) { // no need to listen, the message is already in viewport
        handleReadMessage(time);
      } else {
        this.addScrollListeners();
      }
    });
  }

  render() {
    const {
      text,
      type,
      className,
      isSystemMessage,
      chatUserMessageItem,
      systemMessageType,
      color,
    } = this.props;
    ChatLogger.debug('MessageChatItem::render', this.props);
    if (type === 'poll') {
      return (
        <p
          className={className}
          style={{ borderLeft: `3px ${color} solid`, whiteSpace: 'pre-wrap' }}
          ref={(ref) => { this.text = ref; }}
          dangerouslySetInnerHTML={{ __html: text }}
          data-test="chatPollMessageText"
        />
      );
    } else {
      return (
        <p
          className={className}
          ref={(ref) => { this.text = ref; }}
          dangerouslySetInnerHTML={{ __html: text }}
          data-test={isSystemMessage ? systemMessageType : chatUserMessageItem ? 'chatUserMessageText' : ''}
        />
      );
    }
  }
}

MessageChatItem.propTypes = propTypes;
MessageChatItem.defaultProps = defaultProps;

export default injectIntl(MessageChatItem);
