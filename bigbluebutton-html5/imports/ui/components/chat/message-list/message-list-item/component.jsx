import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedTime, defineMessages, injectIntl } from 'react-intl';
import _ from 'lodash';

import UserAvatar from '/imports/ui/components/user-avatar/component';
import Message from './message/component';

import { styles } from './styles';

const propTypes = {
  user: PropTypes.shape({
    color: PropTypes.string,
    isModerator: PropTypes.bool,
    isOnline: PropTypes.bool,
    name: PropTypes.string,
  }),
  messages: PropTypes.arrayOf(Object).isRequired,
  time: PropTypes.number.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

const defaultProps = {
  user: null,
};

const eventsToBeBound = [
  'scroll',
  'resize',
];

const intlMessages = defineMessages({
  offline: {
    id: 'app.chat.offline',
    description: 'Offline',
  },
});

const isElementInViewport = (el) => {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  const prefetchHeight = 125;

  return (rect.top >= -(prefetchHeight) || rect.bottom >= -(prefetchHeight));
};

class MessageListItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pendingChanges: false,
      preventRender: true,
    };

    this.handleMessageInViewport = _.debounce(this.handleMessageInViewport.bind(this), 50);
  }

  componentDidMount() {
    const { scrollArea } = this.props;

    if (scrollArea) {
      eventsToBeBound.forEach(
        (e) => { scrollArea.addEventListener(e, this.handleMessageInViewport, false); },
      );
    }
    this.handleMessageInViewport();
  }

  componentWillReceiveProps(nextProps) {
    const { messages, user } = this.props;
    const { pendingChanges } = this.state;
    if (pendingChanges) return;

    const hasNewMessage = messages.length !== nextProps.messages.length;
    const hasUserChanged = !_.isEqual(user, nextProps.user);

    this.setState({ pendingChanges: hasNewMessage || hasUserChanged });
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { scrollArea } = this.props;
    if (!scrollArea && nextProps.scrollArea) return true;
    return !nextState.preventRender && nextState.pendingChanges;
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      preventRender,
      pendingChanges,
    } = this.state;
    if (prevState.preventRender && !preventRender && pendingChanges) {
      this.setPendingChanges(false);
    }
  }

  componentWillUnmount() {
    const { scrollArea } = this.props;

    if (scrollArea) {
      eventsToBeBound.forEach(
        (e) => { scrollArea.removeEventListener(e, this.handleMessageInViewport, false); },
      );
    }
  }

  setPendingChanges(pendingChanges) {
    this.setState({ pendingChanges });
  }

  handleMessageInViewport() {
    window.requestAnimationFrame(() => {
      const node = this.item;
      if (node) this.setState({ preventRender: !isElementInViewport(node) });
    });
  }

  renderSystemMessage() {
    const {
      messages,
      chatAreaId,
      handleReadMessage,
    } = this.props;

    return (
      <div className={styles.messages}>
        {messages.map(message => (
          message.text !== ''
            ? (
              <Message
                className={(message.id ? styles.systemMessage : null)}
                key={_.uniqueId('id-')}
                text={message.text}
                time={message.time}
                chatAreaId={chatAreaId}
                handleReadMessage={handleReadMessage}
              />
            ) : null
        ))}
      </div>
    );
  }

  render() {
    const {
      user,
      messages,
      time,
      chatAreaId,
      lastReadMessageTime,
      handleReadMessage,
      scrollArea,
      intl,
    } = this.props;

    const dateTime = new Date(time);

    const regEx = /<a[^>]+>/i;

    if (!user) {
      return this.renderSystemMessage();
    }

    return (
      <div className={styles.item}>
        <div className={styles.wrapper} ref={(ref) => { this.item = ref; }}>
          <div className={styles.avatarWrapper}>
            <UserAvatar
              className={styles.avatar}
              color={user.color}
              moderator={user.isModerator}
            >
              {user.name.toLowerCase().slice(0, 2)}
            </UserAvatar>
          </div>
          <div className={styles.content}>
            <div className={styles.meta}>
              <div className={user.isOnline ? styles.name : styles.logout}>
                <span>{user.name}</span>
                {user.isOnline
                  ? null
                  : (
                    <span className={styles.offline}>
                      {intl.formatMessage(intlMessages.offline)}
                    </span>
                  )}
              </div>
              <time className={styles.time} dateTime={dateTime}>
                <FormattedTime value={dateTime} />
              </time>
            </div>
            <div className={styles.messages}>
              {messages.map(message => (
                <Message
                  className={(regEx.test(message.text) ? styles.hyperlink : styles.message)}
                  key={message.id}
                  text={message.text}
                  time={message.time}
                  chatAreaId={chatAreaId}
                  lastReadMessageTime={lastReadMessageTime}
                  handleReadMessage={handleReadMessage}
                  scrollArea={scrollArea}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

MessageListItem.propTypes = propTypes;
MessageListItem.defaultProps = defaultProps;

export default injectIntl(MessageListItem);
