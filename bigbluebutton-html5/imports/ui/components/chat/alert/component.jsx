import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { defineMessages, injectIntl } from 'react-intl';
import _ from 'lodash';
import injectNotify from '/imports/ui/components/common/toast/inject-notify/component';
import AudioService from '/imports/ui/components/audio/service';
import ChatPushAlert from './push-alert/component';
import { stripTags, unescapeHtml } from '/imports/utils/string-utils';
import Service from '../service';
import Styled from './styles';
import { usePreviousValue } from '/imports/ui/components/utils/hooks';
import { Session } from 'meteor/session';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_CLEAR = CHAT_CONFIG.chat_clear;
const PUBLIC_CHAT_ID = CHAT_CONFIG.public_id;
const POLL_RESULT_KEY = CHAT_CONFIG.system_messages_keys.chat_poll_result;

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
  publicChatMsg: {
    id: 'app.toast.chat.public',
    description: 'public chat toast message title',
  },
  privateChatMsg: {
    id: 'app.toast.chat.private',
    description: 'private chat toast message title',
  },
  pollResults: {
    id: 'app.toast.chat.poll',
    description: 'chat toast message for polls',
  },
  pollResultsClick: {
    id: 'app.toast.chat.pollClick',
    description: 'chat toast click message for polls',
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
  const prevUnreadMessages = usePreviousValue(unreadMessages);

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

        return unescapeHtml(stripTags(content.text));
      });

    return contentMessage;
  };

  const createMessage = (name, message) => (
    <Styled.PushMessageContent>
      <Styled.UserNameMessage>{name}</Styled.UserNameMessage>
      <Styled.ContentMessage>
        {
          mapContentText(message)
            .reduce((acc, text) => [...acc, (<br key={_.uniqueId('br_')} />), text], [])
        }
      </Styled.ContentMessage>
    </Styled.PushMessageContent>
  );

  const createPollMessage = () => (
    <Styled.PushMessageContent>
      <Styled.UserNameMessage>{intl.formatMessage(intlMessages.pollResults)}</Styled.UserNameMessage>
      <Styled.ContentMessagePoll>{intl.formatMessage(intlMessages.pollResultsClick)}</Styled.ContentMessagePoll>
    </Styled.PushMessageContent>
  );

  if (_.isEqual(prevUnreadMessages, unreadMessages)) {
    return null;
  }

  return pushAlertEnabled
    ? unreadMessages.map((timeWindow) => {
      const mappedMessage = Service.mapGroupMessage(timeWindow);

      let content = null;
      let isPollResult = false;
      if (mappedMessage) {
        if (mappedMessage.id.includes(POLL_RESULT_KEY)) {
          content = createPollMessage();
          isPollResult = true;
        } else {
          content = createMessage(mappedMessage.sender.name, mappedMessage.content.slice(-5));
        }
      }

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
              () => {
                if (isPollResult) {
                  Session.set('ignorePollNotifications', true);
                }

                setUnreadMessages(newUnreadMessages);
              }
            }
            onClose={
              () => {
                if (isPollResult) {
                  Session.set('ignorePollNotifications', false);
                }

                setUnreadMessages(newUnreadMessages);
              }
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

export default injectNotify(injectIntl(ChatAlert));
