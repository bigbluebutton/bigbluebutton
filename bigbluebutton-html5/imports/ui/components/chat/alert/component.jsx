import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { defineMessages, injectIntl } from 'react-intl';
import _ from 'lodash';
import AudioService from '/imports/ui/components/audio/service';
import ChatPushAlert from './push-alert/component';
import Service from '../service';
import { styles } from '../styles';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_CLEAR = CHAT_CONFIG.chat_clear;
const PUBLIC_CHAT_ID = CHAT_CONFIG.public_id;

const propTypes = {
  pushAlertEnabled: PropTypes.bool.isRequired,
  audioAlertEnabled: PropTypes.bool.isRequired,
  unreadMessagesCountByChat: PropTypes.arrayOf(PropTypes.object),
  unreadMessagesByChat: PropTypes.arrayOf(PropTypes.array),
  idChatOpen: PropTypes.string.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

const defaultProps = {
  unreadMessagesCountByChat: null,
  unreadMessagesByChat: null,
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

const ChatAlert = (props) => {
  const {
    audioAlertEnabled,
    pushAlertEnabled,
    idChatOpen,
    unreadMessagesCountByChat,
    unreadMessagesByChat,
    intl,
    layoutContextDispatch,
  } = props;

  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [lastAlertTimestampByChat, setLastAlertTimestampByChat] = useState({});
  const [alertEnabledTimestamp, setAlertEnabledTimestamp] = useState(null);

  // audio alerts
  useEffect(() => {
    if (audioAlertEnabled) {
      const unreadObject = unreadMessagesCountByChat;

      const unreadCount = document.hidden
        ? unreadObject.reduce((a, b) => a + b.unreadCounter, 0)
        : unreadObject.filter((chat) => chat.chatId !== idChatOpen)
          .reduce((a, b) => a + b.unreadCounter, 0);

      if (unreadCount > unreadMessagesCount) {
        AudioService.playAlertSound(`${Meteor.settings.public.app.cdn
          + Meteor.settings.public.app.basename
          + Meteor.settings.public.app.instanceId}`
          + '/resources/sounds/notify.mp3');
      }

      setUnreadMessagesCount(unreadCount);
    }
  }, [unreadMessagesCountByChat]);

  // push alerts
  useEffect(() => {
    if (pushAlertEnabled) {
      setAlertEnabledTimestamp(new Date().getTime());
    }
  }, [pushAlertEnabled]);

  useEffect(() => {
    if (pushAlertEnabled) {
      const alertsObject = unreadMessagesByChat;

      let timewindowsToAlert = [];
      let filteredTimewindows = [];

      alertsObject.forEach((chat) => {
        filteredTimewindows = filteredTimewindows.concat(
          chat.filter((timeWindow) => timeWindow.timestamp > alertEnabledTimestamp),
        );
      });

      filteredTimewindows.forEach((timeWindow) => {
        const durationDiff = ALERT_DURATION - (new Date().getTime() - timeWindow.timestamp);

        if ((timeWindow.lastTimestamp > timeWindow.timestamp && durationDiff > 0
          && timeWindow.lastTimestamp > (lastAlertTimestampByChat[timeWindow.chatId] || 0))
          || timeWindow.timestamp
          > (lastAlertTimestampByChat[timeWindow.chatId] || 0) + ALERT_INTERVAL) {
          timewindowsToAlert = timewindowsToAlert
            .filter((item) => item.chatId !== timeWindow.chatId);
          const newTimeWindow = { ...timeWindow };
          newTimeWindow.durationDiff = durationDiff;
          timewindowsToAlert.push(newTimeWindow);

          const newLastAlertTimestampByChat = { ...lastAlertTimestampByChat };
          if (timeWindow.timestamp > (lastAlertTimestampByChat[timeWindow.chatId] || 0)) {
            newLastAlertTimestampByChat[timeWindow.chatId] = timeWindow.timestamp;
            setLastAlertTimestampByChat(newLastAlertTimestampByChat);
          }
        }
      });
      setUnreadMessages(timewindowsToAlert);
    }
  }, [unreadMessagesByChat]);

  const mapContentText = (message) => {
    const contentMessage = message
      .map((content) => {
        if (content.text === PUBLIC_CHAT_CLEAR) {
          return intl.formatMessage(intlMessages.publicChatClear);
        }
        /* this code is to remove html tags that come in the server's messages */
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content.text;
        const textWithoutTag = tempDiv.innerText;
        return textWithoutTag;
      });

    return contentMessage;
  };

  const createMessage = (name, message) => (
    <div className={styles.pushMessageContent}>
      <h3 className={styles.userNameMessage}>{name}</h3>
      <div className={styles.contentMessage}>
        {
          mapContentText(message)
            .reduce((acc, text) => [...acc, (<br key={_.uniqueId('br_')} />), text], [])
        }
      </div>
    </div>
  );

  return pushAlertEnabled
    ? unreadMessages.map((timeWindow) => {
      const mappedMessage = Service.mapGroupMessage(timeWindow);
      const content = mappedMessage
        ? createMessage(mappedMessage.sender.name, mappedMessage.content.slice(-5))
        : null;

      const messageChatId = mappedMessage.chatId === 'MAIN-PUBLIC-GROUP-CHAT' ? PUBLIC_CHAT_ID : mappedMessage.chatId;

      const newUnreadMessages = unreadMessages
        .filter((message) => message.key !== mappedMessage.key);

      return content
        ? (
          <ChatPushAlert
            key={messageChatId}
            chatId={messageChatId}
            content={content}
            title={
              (mappedMessage.chatId === 'MAIN-PUBLIC-GROUP-CHAT')
                ? <span>{intl.formatMessage(intlMessages.appToastChatPublic)}</span>
                : <span>{intl.formatMessage(intlMessages.appToastChatPrivate)}</span>
            }
            onOpen={
              () => setUnreadMessages(newUnreadMessages)
            }
            onClose={
              () => setUnreadMessages(newUnreadMessages)
            }
            alertDuration={timeWindow.durationDiff}
            layoutContextDispatch={layoutContextDispatch}
          />
        ) : null;
    })
    : null;
};
ChatAlert.propTypes = propTypes;
ChatAlert.defaultProps = defaultProps;

export default injectIntl(ChatAlert);
