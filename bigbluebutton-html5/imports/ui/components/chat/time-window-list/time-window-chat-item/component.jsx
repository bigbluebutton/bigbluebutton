import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FormattedTime, defineMessages, injectIntl } from 'react-intl';
import _ from 'lodash';
import UserAvatar from '/imports/ui/components/user-avatar/component';
import cx from 'classnames';
import ChatLogger from '/imports/ui/components/chat/chat-logger/ChatLogger';
import MessageChatItem from './message-chat-item/component';
import PollService from '/imports/ui/components/poll/service';
import Icon from '/imports/ui/components/icon/component';
import { styles } from './styles';

const CHAT_CONFIG = Meteor.settings.public.chat;
const CHAT_CLEAR_MESSAGE = CHAT_CONFIG.system_messages_keys.chat_clear;
const CHAT_POLL_RESULTS_MESSAGE = CHAT_CONFIG.system_messages_keys.chat_poll_result;
const CHAT_PUBLIC_ID = CHAT_CONFIG.public_id;
const CHAT_EMPHASIZE_TEXT = CHAT_CONFIG.moderatorChatEmphasized;

const propTypes = {
  user: PropTypes.shape({
    color: PropTypes.string,
    isModerator: PropTypes.bool,
    isOnline: PropTypes.bool,
    name: PropTypes.string,
  }),
  messages: PropTypes.arrayOf(Object).isRequired,
  timestamp: PropTypes.number,
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
  timestamp: 0,
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
  [CHAT_CLEAR_MESSAGE]: {
    id: 'app.chat.clearPublicChatMessage',
    description: 'message of when clear the public chat',
  }
});

class TimeWindowChatItem extends PureComponent {
  componentDidUpdate(prevProps, prevState) {
    const { height, forceCacheUpdate, systemMessage, index } = this.props;
    const elementHeight = this.itemRef ? this.itemRef.clientHeight : null;

    if (systemMessage && elementHeight && height !== 'auto' && elementHeight !== height) {
      forceCacheUpdate(index);
    }

    ChatLogger.debug('TimeWindowChatItem::componentDidUpdate::props', { ...this.props }, { ...prevProps });
    ChatLogger.debug('TimeWindowChatItem::componentDidUpdate::state', { ...this.state }, { ...prevState });
  }

  componentWillMount() {
    ChatLogger.debug('TimeWindowChatItem::componentWillMount::props', { ...this.props });
    ChatLogger.debug('TimeWindowChatItem::componentWillMount::state', { ...this.state });
  }

  componentWillUnmount() {
    ChatLogger.debug('TimeWindowChatItem::componentWillUnmount::props', { ...this.props });
    ChatLogger.debug('TimeWindowChatItem::componentWillUnmount::state', { ...this.state });
  }

  renderSystemMessage() {
    const {
      messages,
      chatAreaId,
      handleReadMessage,
      messageKey,
      intl,
    } = this.props;

    if (messages && messages[0].id.includes(CHAT_POLL_RESULTS_MESSAGE)) {
      return this.renderPollItem();
    }

    return (
      <div
        className={styles.item}
        key={`time-window-chat-item-${messageKey}`}
        ref={element => this.itemRef = element} >
        <div className={styles.messages}>
          {messages.map(message => (
            message.text !== ''
              ? (
                <MessageChatItem
                  className={(message.id ? styles.systemMessage : styles.systemMessageNoBorder)}
                  key={message.id ? message.id : _.uniqueId('id-')}
                  text={intlMessages[message.text] ? intl.formatMessage(intlMessages[message.text]) : message.text }
                  time={message.time}
                  isSystemMessage={message.id ? true : false}
                  systemMessageType={message.text === CHAT_CLEAR_MESSAGE ? 'chatClearMessageText' : 'chatWelcomeMessageText'}
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
      timestamp,
      chatAreaId,
      scrollArea,
      intl,
      messages,
      messageKey,
      dispatch,
      chatId,
      read,
      name,
      color,
      isModerator,
      avatar,
      isOnline,
    } = this.props;

    const dateTime = new Date(timestamp);
    const regEx = /<a[^>]+>/i;
    ChatLogger.debug('TimeWindowChatItem::renderMessageItem', this.props);
    const defaultAvatarString = name?.toLowerCase().slice(0, 2) || "  ";
    const emphasizedTextClass = isModerator && CHAT_EMPHASIZE_TEXT && chatId === CHAT_PUBLIC_ID ?
      styles.emphasizedMessage : null;

    return (
      <div className={styles.item} key={`time-window-${messageKey}`}>
        <div className={styles.wrapper}>
          <div className={styles.avatarWrapper}>
            <UserAvatar
              className={styles.avatar}
              color={color}
              moderator={isModerator}
              avatar={avatar}
            >
              {defaultAvatarString}
            </UserAvatar>
          </div>
          <div className={styles.content}>
            <div className={styles.meta}>
              <div className={isOnline ? styles.name : styles.logout}>
                <span>{name}</span>
                {isOnline
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
                  className={regEx.test(message.text) ?
                    cx(styles.hyperlink, emphasizedTextClass) :
                    cx(styles.message, emphasizedTextClass)}
                  key={message.id}
                  text={message.text}
                  time={message.time}
                  chatAreaId={chatAreaId}
                  dispatch={dispatch}
                  read={message.read}
                  chatUserMessageItem={true}
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
      timestamp,
      color,
      intl,
      getPollResultString,
      messages,
      extra,
      scrollArea,
      chatAreaId,
      lastReadMessageTime,
      handleReadMessage,
    } = this.props;

    const dateTime = new Date(timestamp);

    return messages ? (
      <div className={styles.item} key={_.uniqueId('message-poll-item-')}>
        <div className={styles.wrapper} ref={(ref) => { this.item = ref; }}>
        <div className={styles.avatarWrapper}>
            <UserAvatar
              className={styles.avatar}
              color={PollService.POLL_AVATAR_COLOR}
              moderator={true}
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
              text={getPollResultString(extra.pollResultData, intl)}
              time={messages[0].time}
              chatAreaId={chatAreaId}
              lastReadMessageTime={lastReadMessageTime}
              handleReadMessage={handleReadMessage}
              scrollArea={scrollArea}
              color={color}
            />
          </div>
        </div>
      </div>
    ) : null;
  }

  render() {
    const {
      systemMessage,
    } = this.props;
    ChatLogger.debug('TimeWindowChatItem::render', {...this.props});
    if (systemMessage) {
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
