import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FormattedTime, defineMessages, injectIntl } from 'react-intl';
import _ from 'lodash';
import Icon from '/imports/ui/components/icon/component';
import UserAvatar from '/imports/ui/components/user-avatar/component';
import cx from 'classnames';
import ChatLogger from '/imports/ui/components/chat/chat-logger/ChatLogger';
import MessageChatItem from './message-chat-item/component';

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

class TimeWindowChatItem extends PureComponent {
  componentDidUpdate(prevProps, prevState) {
    ChatLogger.debug('TimeWindowChatItem::componentDidUpdate::props', { ...this.props }, { ...prevProps });
    ChatLogger.debug('TimeWindowChatItem::componentDidUpdate::state', { ...this.state }, { ...prevState });
  }

  componentWillMount() {
    ChatLogger.debug('TimeWindowChatItem::componentWillMount::props', { ...this.props });
    ChatLogger.debug('TimeWindowChatItem::componentWillMount::state', { ...this.state });
  }

  renderSystemMessage() {
    const {
      messages,
      chatAreaId,
      handleReadMessage,
      messageKey
    } = this.props;

    return (
      <div className={styles.item} key={`time-window-chat-item-${messageKey}`}>
        <div className={styles.messages}>
          {messages.map(message => (
            message.text !== ''
              ? (
                <MessageChatItem
                  className={(message.id ? styles.systemMessage : styles.systemMessageNoBorder)}
                  key={message.id ? message.id : _.uniqueId('id-')}
                  text={message.text}
                  time={message.time}
                  isSystemMessage={message.id ? true : false}
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
      scrollArea,
      intl,
      messages,
      messageKey,
      dispatch,
      chatId,
      read,
    } = this.props;

    if (messages && messages[0].text.includes('bbb-published-poll-<br/>')) {
      return this.renderPollItem();
    }

    const dateTime = new Date(time);
    const regEx = /<a[^>]+>/i;
    ChatLogger.debug('TimeWindowChatItem::renderMessageItem', this.props);
    const defaultAvatarString = user?.name?.toLowerCase().slice(0, 2) || "  ";

    return (
      <div className={styles.item} key={`time-window-${messageKey}`}>
        <div className={styles.wrapper}>
          <div className={styles.avatarWrapper}>
            <UserAvatar
              className={styles.avatar}
              color={user.color}
              moderator={user.isModerator}
              avatar={user.avatar}
            >
              {defaultAvatarString}
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
                <MessageChatItem
                  className={(regEx.test(message.text) ? styles.hyperlink : styles.message)}
                  key={message.id}
                  text={message.text}
                  time={message.time}
                  chatAreaId={chatAreaId}
                  dispatch={dispatch}
                  read={message.read}
                  handleReadMessage={(timestamp) => {
                    if (!read) {
                      dispatch({
                        type: 'last_read_message_timestamp_changed',
                        value: {
                          chatId,
                          timestamp,
                        },
                      });
                    }
                  }}
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
            <MessageChatItem
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
    ChatLogger.debug('TimeWindowChatItem::render', {...this.props});
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

TimeWindowChatItem.propTypes = propTypes;
TimeWindowChatItem.defaultProps = defaultProps;

export default injectIntl(TimeWindowChatItem);
