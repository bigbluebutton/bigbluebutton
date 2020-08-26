import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import fastdom from 'fastdom';
import { defineMessages, injectIntl } from 'react-intl';

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
});

class MessageListItem extends PureComponent {
  constructor(props) {
    super(props);

    this.ticking = false;

    this.handleMessageInViewport = _.debounce(this.handleMessageInViewport.bind(this), 50);

    this.renderPollListItem = this.renderPollListItem.bind(this);
  }

  componentDidMount() {
    this.listenToUnreadMessages();
  }

  componentDidUpdate() {
    this.listenToUnreadMessages();
  }

  componentWillUnmount() {
    // This was added 3 years ago, but never worked. Leaving it around in case someone returns
    // and decides it needs to be fixed like the one in listenToUnreadMessages()
    // if (!lastReadMessageTime > time) {
    //  return;
    // }

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
          lastReadMessageTime,
        } = this.props;

        if (lastReadMessageTime > time) {
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
    } = this.props;

    if (scrollArea) {
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
      lastReadMessageTime,
    } = this.props;

    if (lastReadMessageTime > time) {
      return;
    }

    const node = this.text;

    fastdom.measure(() => {
      const {
        lastReadMessageTime: updatedLastReadMessageTime,
      } = this.props;
      // this function is called after so we need to get the updated lastReadMessageTime

      if (updatedLastReadMessageTime > time) {
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
    } = this.props;

    const formatBoldBlack = s => s.bold().fontcolor('black');

    let _text = text.replace('bbb-published-poll-<br/>', '');

    if (!isDefaultPoll) {
      const entries = _text.split('<br/>');
      const options = [];
      entries.map((e) => { options.push([e.slice(0, e.indexOf(':'))]); return e; });
      options.map((o, idx) => {
        _text = formatBoldBlack(_text.replace(o, idx + 1));
        return _text;
      });
      _text += formatBoldBlack(`<br/><br/>${intl.formatMessage(intlMessages.legendTitle)}`);
      options.map((o, idx) => { _text += `<br/>${idx + 1}: ${o}`; return _text; });
    }

    return (
      <p
        className={className}
        style={{ borderLeft: `3px ${color} solid` }}
        ref={(ref) => { this.text = ref; }}
        dangerouslySetInnerHTML={{ __html: isDefaultPoll ? formatBoldBlack(_text) : _text }}
        data-test="chatMessageText"
      />
    );
  }

  render() {
    const {
      text,
      type,
      className,
    } = this.props;

    if (type === 'poll') return this.renderPollListItem();

    return (
      <p
        className={className}
        ref={(ref) => { this.text = ref; }}
        dangerouslySetInnerHTML={{ __html: text }}
        data-test="chatMessageText"
      />
    );
  }
}

MessageListItem.propTypes = propTypes;
MessageListItem.defaultProps = defaultProps;

export default injectIntl(MessageListItem);
