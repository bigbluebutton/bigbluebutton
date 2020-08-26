import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedTime, defineMessages, injectIntl } from 'react-intl';
import _ from 'lodash';
import Icon from '/imports/ui/components/icon/component';
import UserAvatar from '/imports/ui/components/user-avatar/component';
import cx from 'classnames';
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
  time: PropTypes.number,
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
  time: 0,
};

const intlMessages = defineMessages({
  offline: {
    id: 'app.chat.offline',
    description: 'Offline',
  },
  pollResult: {
    id: 'app.chat.pollResult',
    description: 'used in place of user name who published poll to chat',
  },
});

class MessageListItem extends Component {
  shouldComponentUpdate(nextProps) {
    const {
      scrollArea,
      messages,
      user,
      messageId,
    } = this.props;

    const {
      scrollArea: nextScrollArea,
      messages: nextMessages,
      user: nextUser,
      messageId: nextMessageId,
    } = nextProps;

    if (!scrollArea && nextScrollArea) return true;

    const hasNewMessage = messages.length !== nextMessages.length;
    const hasIdChanged = messageId !== nextMessageId;
    const hasUserChanged = user && nextUser
      && (user.isModerator !== nextUser.isModerator || user.isOnline !== nextUser.isOnline);

    return hasNewMessage || hasIdChanged || hasUserChanged;
  }

  renderSystemMessage() {
    const {
      messages,
      chatAreaId,
      handleReadMessage,
    } = this.props;

    return (
      <div className={styles.item}>
        <div className={styles.messages}>
          {messages.map(message => (
            message.text !== ''
              ? (
                <Message
                  className={(message.id ? styles.systemMessage : styles.systemMessageNoBorder)}
                  key={message.id ? message.id : _.uniqueId('id-')}
                  text={message.text}
                  time={message.time}
                  chatAreaId={chatAreaId}
                  handleReadMessage={handleReadMessage}
                />
              ) : null
          ))}
        </div>
      </div>
    );
  }

  renderMessageItem() {
    const {
      user,
      time,
      chatAreaId,
      lastReadMessageTime,
      handleReadMessage,
      scrollArea,
      intl,
      messages,
    } = this.props;

    if (messages && messages[0].text.includes('bbb-published-poll-<br/>')) {
      return this.renderPollItem();
    }

    const dateTime = new Date(time);
    const regEx = /<a[^>]+>/i;

    return (
      <div className={styles.item} key={_.uniqueId('message-list-item-')}>
        <div className={styles.wrapper}>
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
            <div className={styles.messages} data-test="chatUserMessage">
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

  renderPollItem() {
    const {
      user,
      time,
      intl,
      isDefaultPoll,
      messages,
      scrollArea,
      chatAreaId,
      lastReadMessageTime,
      handleReadMessage,
    } = this.props;

    const dateTime = new Date(time);

    return messages ? (
      <div className={styles.item} key={_.uniqueId('message-poll-item-')}>
        <div className={styles.wrapper} ref={(ref) => { this.item = ref; }}>
          <div className={styles.avatarWrapper}>
            <UserAvatar
              className={styles.avatar}
              color={user.color}
              moderator={user.isModerator}
            >
              {<Icon className={styles.isPoll} iconName="polling" />}
            </UserAvatar>
          </div>
          <div className={styles.content}>
            <div className={styles.meta}>
              <div className={styles.name}>
                <span>{intl.formatMessage(intlMessages.pollResult)}</span>
              </div>
              <time className={styles.time} dateTime={dateTime}>
                <FormattedTime value={dateTime} />
              </time>
            </div>
            <Message
              type="poll"
              className={cx(styles.message, styles.pollWrapper)}
              key={messages[0].id}
              text={messages[0].text}
              time={messages[0].time}
              chatAreaId={chatAreaId}
              lastReadMessageTime={lastReadMessageTime}
              handleReadMessage={handleReadMessage}
              scrollArea={scrollArea}
              color={user.color}
              isDefaultPoll={isDefaultPoll(messages[0].text.replace('bbb-published-poll-<br/>', ''))}
            />
          </div>
        </div>
      </div>
    ) : null;
  }

  render() {
    const {
      user,
    } = this.props;

    if (!user) {
      return this.renderSystemMessage();
    }

    return (
      <div className={styles.item}>
        {this.renderMessageItem()}
      </div>
    );
  }
}

MessageListItem.propTypes = propTypes;
MessageListItem.defaultProps = defaultProps;

export default injectIntl(MessageListItem);
