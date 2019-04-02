import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { Session } from 'meteor/session';
import _ from 'lodash';
import UnreadMessages from '/imports/ui/services/unread-messages';
import ChatAudioAlert from './audio-alert/component';
import ChatPushAlert from './push-alert/component';
import Service from '../service';
import { styles } from '../styles';

const propTypes = {
  pushAlertDisabled: PropTypes.bool.isRequired,
  activeChats: PropTypes.arrayOf(PropTypes.object).isRequired,
  audioAlertDisabled: PropTypes.bool.isRequired,
  joinTimestamp: PropTypes.number.isRequired,
};

const intlMessages = defineMessages({
  appToastChatPublic: {
    id: 'app.toast.chat.public',
    description: 'when entry various message',
  },
  appToastChatPrivate: {
    id: 'app.toast.chat.private',
    description: 'when entry various message',
  },
  appToastChatSystem: {
    id: 'app.toast.chat.system',
    description: 'system for use',
  },
  publicChatClear: {
    id: 'app.chat.clearPublicChatMessage',
    description: 'message of when clear the public chat',
  },
});

const ALERT_INTERVAL = 5000; // 5 seconds
const ALERT_DURATION = 4000; // 4 seconds

class ChatAlert extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      alertEnabledTimestamp: props.joinTimestamp,
      lastAlertTimestampByChat: {},
      pendingNotificationsByChat: {},
    };
  }

  componentDidUpdate(prevProps) {
    const {
      pushAlertDisabled,
      activeChats,
      joinTimestamp,
    } = this.props;

    const {
      alertEnabledTimestamp,
      lastAlertTimestampByChat,
      pendingNotificationsByChat,
    } = this.state;
    // Avoid alerting messages received before enabling alerts
    if (prevProps.pushAlertDisabled && !pushAlertDisabled) {
      const newAlertEnabledTimestamp = Service.getLastMessageTimestampFromChatList(activeChats);
      this.setAlertEnabledTimestamp(newAlertEnabledTimestamp);
      return;
    }


    // Keep track of messages that was not alerted yet
    const unalertedMessagesByChatId = {};

    activeChats
      .filter(chat => chat.id !== Session.get('idChatOpen'))
      .filter(chat => chat.unreadCounter > 0)
      .forEach((chat) => {
        const chatId = (chat.id === 'public') ? 'MAIN-PUBLIC-GROUP-CHAT' : chat.id;
        const thisChatUnreadMessages = UnreadMessages.getUnreadMessages(chatId);

        unalertedMessagesByChatId[chatId] = thisChatUnreadMessages.filter((msg) => {
          const messageChatId = (msg.chatId === 'MAIN-PUBLIC-GROUP-CHAT') ? msg.chatId : msg.sender;
          const retorno = (msg
            && msg.timestamp > alertEnabledTimestamp
            && msg.timestamp > joinTimestamp
            && msg.timestamp > (lastAlertTimestampByChat[messageChatId] || 0)
          );
          return retorno;
        });

        if (!unalertedMessagesByChatId[chatId].length) delete unalertedMessagesByChatId[chatId];
      });

    const lastUnalertedMessageTimestampByChat = {};
    Object.keys(unalertedMessagesByChatId).forEach((chatId) => {
      lastUnalertedMessageTimestampByChat[chatId] = unalertedMessagesByChatId[chatId]
        .reduce(Service.maxTimestampReducer, 0);
    });

    // Keep track of chats that need to be alerted now (considering alert interval)
    const chatsWithPendingAlerts = Object.keys(lastUnalertedMessageTimestampByChat)
      .filter(chatId => lastUnalertedMessageTimestampByChat[chatId]
        > ((lastAlertTimestampByChat[chatId] || 0) + ALERT_INTERVAL)
        && !(chatId in pendingNotificationsByChat));

    if (!chatsWithPendingAlerts.length) return;

    const newPendingNotificationsByChat = Object.assign({},
      ...chatsWithPendingAlerts.map(chatId => ({ [chatId]: unalertedMessagesByChatId[chatId] })));

    // Mark messages as alerted
    const newLastAlertTimestampByChat = { ...lastAlertTimestampByChat };

    chatsWithPendingAlerts.forEach(
      (chatId) => {
        newLastAlertTimestampByChat[chatId] = lastUnalertedMessageTimestampByChat[chatId];
      },
    );

    if (!pushAlertDisabled) {
      this.setChatMessagesState(newPendingNotificationsByChat, newLastAlertTimestampByChat);
    }
  }

  setAlertEnabledTimestamp(newAlertEnabledTimestamp) {
    const { alertEnabledTimestamp } = this.state;
    if (newAlertEnabledTimestamp > 0 && alertEnabledTimestamp !== newAlertEnabledTimestamp) {
      this.setState({ alertEnabledTimestamp: newAlertEnabledTimestamp });
    }
  }

  setChatMessagesState(pendingNotificationsByChat, lastAlertTimestampByChat) {
    this.setState({ pendingNotificationsByChat, lastAlertTimestampByChat });
  }


  mapContentText(message) {
    const {
      intl,
    } = this.props;
    const contentMessage = message
      .map((content) => {
        if (content.text === 'PUBLIC_CHAT_CLEAR') return intl.formatMessage(intlMessages.publicChatClear);
        /* this code is to remove html tags that come in the server's messages */
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content.text;
        const textWithoutTag = tempDiv.innerText;
        return textWithoutTag;
      });

    return contentMessage;
  }

  createMessage(name, message) {
    return (
      <div className={styles.pushMessageContent}>
        <h3 className={styles.userNameMessage}>{name}</h3>
        <div className={styles.contentMessage}>
          {
            this.mapContentText(message)
              .reduce((acc, text) => [...acc, (<br key={_.uniqueId('br_')} />), text], [])
          }
        </div>
      </div>
    );
  }

  render() {
    const {
      audioAlertDisabled,
      pushAlertDisabled,
      intl,
    } = this.props;
    const {
      pendingNotificationsByChat,
    } = this.state;

    const shouldPlay = Object.keys(pendingNotificationsByChat).length > 0;

    return (
      <span>
        {!audioAlertDisabled ? <ChatAudioAlert play={shouldPlay} /> : null}
        {
          !pushAlertDisabled
            ? Object.keys(pendingNotificationsByChat)
              .map((chatId) => {
                // Only display the latest group of messages (up to 5 messages)
                const reducedMessage = Service
                  .reduceAndMapGroupMessages(pendingNotificationsByChat[chatId].slice(-5)).pop();

                if (!reducedMessage) return null;

                const content = this
                  .createMessage(reducedMessage.sender.name, reducedMessage.content);

                return (
                  <ChatPushAlert
                    key={chatId}
                    chatId={chatId}
                    content={content}
                    title={
                      (chatId === 'MAIN-PUBLIC-GROUP-CHAT')
                        ? <span>{intl.formatMessage(intlMessages.appToastChatPublic)}</span>
                        : <span>{intl.formatMessage(intlMessages.appToastChatPrivate)}</span>
                    }
                    onOpen={
                      () => {
                        let pendingNotifications = pendingNotificationsByChat;
                        delete pendingNotifications[chatId];
                        pendingNotifications = { ...pendingNotifications };
                        this.setState({ pendingNotificationsByChat: pendingNotifications });
                      }}
                    alertDuration={ALERT_DURATION}
                  />
                );
              })
            : null
        }
      </span>
    );
  }
}
ChatAlert.propTypes = propTypes;

export default injectIntl(ChatAlert);
