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
  scrollArea: PropTypes.instanceOf(Element),
  chatAreaId: PropTypes.string.isRequired,
  handleReadMessage: PropTypes.func.isRequired,
  lastReadMessageTime: PropTypes.number,
};

const defaultProps = {
  user: null,
  scrollArea: null,
  lastReadMessageTime: 0,
};

const intlMessages = defineMessages({
  offline: {
    id: 'app.chat.offline',
    description: 'Offline',
  },
});

class MessageListItem extends Component {
  shouldComponentUpdate(nextProps) {
    const {
      scrollArea,
      messages,
      user,
    } = this.props;

    const {
      scrollArea: nextScrollArea,
      messages: nextMessages,
      user: nextUser,
    } = nextProps;

    if (!scrollArea && nextScrollArea) return true;

    const hasNewMessage = messages.length !== nextMessages.length;
    const hasUserChanged = user && nextUser
      && (user.isModerator !== nextUser.isModerator || user.isOnline !== nextUser.isOnline);

    return hasNewMessage || hasUserChanged;
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
                      {`(${intl.formatMessage(intlMessages.offline)})`}
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
