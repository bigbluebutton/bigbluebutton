import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import fastdom from 'fastdom';
import { defineMessages, injectIntl } from 'react-intl';
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
    && rect.left >= 0
    && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
    && rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

const intlMessages = defineMessages({
  legendTitle: {
    id: 'app.polling.pollingTitle',
    description: 'heading for chat poll legend',
  },
  pollQuestionTitle: {
    id: 'app.polling.pollQuestionTitle',
    description: 'title displayed before poll question',
  },
});

class MessageChatItem extends PureComponent {
  constructor(props) {
    super(props);

    this.ticking = false;

    this.handleMessageInViewport = _.debounce(this.handleMessageInViewport.bind(this), 50);

    this.renderPollListItem = this.renderPollListItem.bind(this);
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

        if (isElementInViewport(node) && !read) {
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

  renderPollListItem() {
    const {
      intl,
      text,
      className,
      color,
      isDefaultPoll,
      extractPollQuestion,
    } = this.props;

    const formatBoldBlack = s => s.bold().fontcolor('black');

    // Sanitize. See: https://gist.github.com/sagewall/47164de600df05fb0f6f44d48a09c0bd
    const sanitize = (value) => {
      const div = document.createElement('div');
      div.appendChild(document.createTextNode(value));
      return div.innerHTML;
    };

    let _text = text.replace('bbb-published-poll-<br/>', '');

    const { pollQuestion, pollText: newPollText } = extractPollQuestion(_text);
    _text = newPollText;

    if (!isDefaultPoll) {
      const entries = _text.split('<br/>');
      const options = [];
      _text = _text.split('<br#>').join('<br/>');

      entries.map((e) => {
        e = e.split('<br#>').join('<br/>');
        const sanitizedEntry = sanitize(e);
        _text = _text.replace(e, sanitizedEntry);
        e = sanitizedEntry;

        options.push([e.slice(0, e.indexOf(':'))]);
        return e;
      });
      options.map((o, idx) => {
        if (o[0] !== '') {
          _text = formatBoldBlack(_text.replace(o, idx + 1));
        }
        return _text;
      });
      _text += formatBoldBlack(`<br/><br/>${intl.formatMessage(intlMessages.legendTitle)}`);
      options.map((o, idx) => {
        if (o[0] !== '') {
          _text += `<br/>${idx + 1}: ${o}`;
        }
        return _text;
      });
    }

    if (isDefaultPoll) {
      _text = formatBoldBlack(_text);
    }

    if (pollQuestion.trim() !== '') {
      const sanitizedPollQuestion = sanitize(pollQuestion.split('<br#>').join(' '));

      _text = `${formatBoldBlack(intl.formatMessage(intlMessages.pollQuestionTitle))}<br/>${sanitizedPollQuestion}<br/><br/>${_text}`;
    }

    return (
      <p
        className={className}
        style={{ borderLeft: `3px ${color} solid` }}
        ref={(ref) => { this.text = ref; }}
        dangerouslySetInnerHTML={{ __html: _text }}
        data-test="chatPollMessageText"
      />
    );
  }

  render() {
    const {
      text,
      type,
      className,
      isSystemMessage,
      chatUserMessageItem,
      systemMessageType,
    } = this.props;
    ChatLogger.debug('MessageChatItem::render', this.props);
    if (type === 'poll') return this.renderPollListItem();

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

MessageChatItem.propTypes = propTypes;
MessageChatItem.defaultProps = defaultProps;

export default injectIntl(MessageChatItem);
