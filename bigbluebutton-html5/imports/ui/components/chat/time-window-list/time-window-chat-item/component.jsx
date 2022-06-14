import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FormattedTime, defineMessages, injectIntl } from 'react-intl';
import _ from 'lodash';
import UserAvatar from '/imports/ui/components/user-avatar/component';
import ChatLogger from '/imports/ui/components/chat/chat-logger/ChatLogger';
import PollService from '/imports/ui/components/poll/service';
import Styled from './styles';

const CHAT_CONFIG = Meteor.settings.public.chat;
const CHAT_CLEAR_MESSAGE = CHAT_CONFIG.system_messages_keys.chat_clear;
const CHAT_POLL_RESULTS_MESSAGE = CHAT_CONFIG.system_messages_keys.chat_poll_result;
const CHAT_PUBLIC_ID = CHAT_CONFIG.public_id;
const CHAT_EMPHASIZE_TEXT = CHAT_CONFIG.moderatorChatEmphasized;

const propTypes = {
  user: PropTypes.shape({
    color: PropTypes.string,
    messageFromModerator: PropTypes.bool,
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
  },
  breakoutDurationUpdated: {
    id: 'app.chat.breakoutDurationUpdated',
    description: 'used when the breakout duration is updated',
  },
});

class TimeWindowChatItem extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      forcedUpdateCount: 0,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const { height, forceCacheUpdate, index } = this.props;
    const elementHeight = this.itemRef ? this.itemRef.clientHeight : null;

    if (elementHeight && height !== 'auto' && elementHeight !== height && this.state.forcedUpdateCount < 10) {
      // forceCacheUpdate() internally calls forceUpdate(), so we need a stop flag
      // and cannot rely on shouldComponentUpdate() and other comparisons.
      forceCacheUpdate(index);
      this.setState(({ forcedUpdateCount }) => ({ forcedUpdateCount: forcedUpdateCount + 1 }));
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
      messageValues,
      chatAreaId,
      handleReadMessage,
      messageKey,
      intl,
    } = this.props;

    if (messages && messages[0].id.includes(CHAT_POLL_RESULTS_MESSAGE)) {
      return this.renderPollItem();
    }

    return (
      <Styled.Item
        key={`time-window-chat-item-${messageKey}`}
        ref={element => this.itemRef = element} >
        <Styled.Messages>
          {messages.map((message) => (
            message.text !== ''
              ? (
                <Styled.SystemMessageChatItem
                  border={message.id}
                  key={message.id ? message.id : _.uniqueId('id-')}
                  text={intlMessages[message.text] ? intl.formatMessage(
                    intlMessages[message.text],
                    messageValues || {},
                  ) : message.text}
                  time={message.time}
                  isSystemMessage={message.id ? true : false}
                  systemMessageType={message.text === CHAT_CLEAR_MESSAGE ? 'chatClearMessageText' : 'chatWelcomeMessageText'}
                  chatAreaId={chatAreaId}
                  handleReadMessage={handleReadMessage}
                />
              ) : null
          ))}
        </Styled.Messages>
      </Styled.Item>
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
      messageFromModerator,
      avatar,
      isOnline,
      isSystemSender,
    } = this.props;

    const dateTime = new Date(timestamp);
    const regEx = /<a[^>]+>/i;
    ChatLogger.debug('TimeWindowChatItem::renderMessageItem', this.props);
    const defaultAvatarString = name?.toLowerCase().slice(0, 2) || "  ";
    const emphasizedText = messageFromModerator && CHAT_EMPHASIZE_TEXT && chatId === CHAT_PUBLIC_ID;

    return (
      <Styled.Item
        key={`time-window-${messageKey}`}
        ref={element => this.itemRef = element}
      >
        <Styled.Wrapper isSystemSender={isSystemSender}>
          <Styled.AvatarWrapper>
            <UserAvatar
              color={color}
              moderator={messageFromModerator}
              avatar={avatar}
            >
              {defaultAvatarString}
            </UserAvatar>
          </Styled.AvatarWrapper>
          <Styled.Content>
            <Styled.Meta>
              <Styled.Name isOnline={isOnline}>
                <span>{name}</span>
                {isOnline
                  ? null
                  : (
                    <Styled.Offline>
                      {`(${intl.formatMessage(intlMessages.offline)})`}
                    </Styled.Offline>
                  )}
              </Styled.Name>
              <Styled.Time dateTime={dateTime}>
                <FormattedTime value={dateTime} />
              </Styled.Time>
            </Styled.Meta>
            <Styled.Messages>
              {messages.map(message => (
                <Styled.ChatItem
                  hasLink={regEx.test(message.text)}
                  emphasizedMessage={emphasizedText}
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
            </Styled.Messages>
          </Styled.Content>
        </Styled.Wrapper>
      </Styled.Item>
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
      dispatch,
      read,
      chatId,
    } = this.props;

    const dateTime = new Date(timestamp);

    return messages ? (
      <Styled.Item key={_.uniqueId('message-poll-item-')}>
        <Styled.Wrapper ref={(ref) => { this.item = ref; }}>
          <Styled.AvatarWrapper>
            <UserAvatar
              color={PollService.POLL_AVATAR_COLOR}
              moderator={true}
            >
              {<Styled.PollIcon iconName="polling" />}
            </UserAvatar>
          </Styled.AvatarWrapper>
          <Styled.Content>
            <Styled.Meta>
              <Styled.Name>
                <span>{intl.formatMessage(intlMessages.pollResult)}</span>
              </Styled.Name>
              <Styled.Time dateTime={dateTime}>
                <FormattedTime value={dateTime} />
              </Styled.Time>
            </Styled.Meta>
            <Styled.PollMessageChatItem
              type="poll"
              key={messages[0].id}
              text={getPollResultString(extra.pollResultData, intl)}
              time={messages[0].time}
              chatAreaId={chatAreaId}
              lastReadMessageTime={lastReadMessageTime}
              handleReadMessage={(timestamp) => {
                handleReadMessage(timestamp);

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
              color={color}
            />
          </Styled.Content>
        </Styled.Wrapper>
      </Styled.Item>
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

    return this.renderMessageItem();
  }
}

TimeWindowChatItem.propTypes = propTypes;
TimeWindowChatItem.defaultProps = defaultProps;

export default injectIntl(TimeWindowChatItem);
