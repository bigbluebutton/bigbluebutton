import React, { useCallback, useEffect, useRef } from 'react';
import { isEqual } from 'radash';
import { defineMessages, useIntl } from 'react-intl';
import { layoutSelect, layoutSelectInput, layoutDispatch } from '/imports/ui/components/layout/context';
import { Input, Layout } from '/imports/ui/components/layout/layoutTypes';
import { PANELS } from '/imports/ui/components/layout/enums';
import usePreviousValue from '/imports/ui/hooks/usePreviousValue';
import { stripTags, unescapeHtml } from '/imports/utils/string-utils';
import { ChatMessageType } from '/imports/ui/core/enums/chat';
import {
  CHAT_MESSAGE_STREAM,
  ChatMessageStreamResponse,
  Message,
} from './queries';
import ChatPushAlert from './push-alert/component';
import Styled from './styles';
import Service from './service';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import Auth from '/imports/ui/services/auth';

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
  userAway: {
    id: 'app.chat.away',
    description: 'message when user is away',
  },
  userNotAway: {
    id: 'app.chat.notAway',
    description: 'message when user is no longer away',
  },
});

const ALERT_DURATION = 4000; // 4 seconds

interface ChatAlertGraphqlProps {
  idChatOpen: string;
  layoutContextDispatch: () => void;
  chatUnreadMessages: Array<Message> | null;
  audioAlertEnabled: boolean;
  pushAlertEnabled: boolean;
}

const ChatAlertGraphql: React.FC<ChatAlertGraphqlProps> = (props) => {
  const {
    audioAlertEnabled,
    idChatOpen,
    layoutContextDispatch,
    pushAlertEnabled,
    chatUnreadMessages,
  } = props;
  const intl = useIntl();
  const history = useRef(new Set<string>());
  const prevChatUnreadMessages = usePreviousValue(chatUnreadMessages);
  const chatMessagesDidChange = !isEqual(prevChatUnreadMessages, chatUnreadMessages);
  const shouldRenderChatAlerts = chatMessagesDidChange
    && !!chatUnreadMessages
    && chatUnreadMessages.length > 0;
  const shouldPlayAudioAlert = useCallback(
    (m: Message) => m.senderId !== Auth.userID && !history.current.has(m.messageId),
    [history.current],
  );

  const CHAT_CONFIG = window.meetingClientSettings.public.chat;
  const PUBLIC_CHAT_ID = CHAT_CONFIG.public_id;
  const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;

  useEffect(() => {
    if (shouldRenderChatAlerts) {
      chatUnreadMessages.forEach((m) => {
        history.current.add(m.messageId);
      });
    }
  });

  let playAudioAlert = false;

  if (shouldRenderChatAlerts) {
    playAudioAlert = chatUnreadMessages.some(shouldPlayAudioAlert);
  }

  if (audioAlertEnabled && playAudioAlert) {
    Service.playAlertSound();
  }

  const mapTextContent = (msg: Message) => {
    if (msg.messageType === ChatMessageType.USER_AWAY_STATUS_MSG) {
      const { away } = JSON.parse(msg.messageMetadata as string);

      return away
        ? intl.formatMessage(intlMessages.userAway)
        : intl.formatMessage(intlMessages.userNotAway);
    }

    if (msg.messageType === ChatMessageType.CHAT_CLEAR) {
      return intl.formatMessage(intlMessages.publicChatClear);
    }

    return unescapeHtml(stripTags(msg.message));
  };

  const createMessage = (msg: Message) => (
    <Styled.PushMessageContent>
      <Styled.UserNameMessage>{msg.senderName}</Styled.UserNameMessage>
      <Styled.ContentMessage>
        {mapTextContent(msg)}
      </Styled.ContentMessage>
    </Styled.PushMessageContent>
  );

  const createPollMessage = () => (
    <Styled.PushMessageContent>
      <Styled.UserNameMessage>
        {intl.formatMessage(intlMessages.pollResults)}
      </Styled.UserNameMessage>
      <Styled.ContentMessagePoll>
        {intl.formatMessage(intlMessages.pollResultsClick)}
      </Styled.ContentMessagePoll>
    </Styled.PushMessageContent>
  );

  const renderToast = (message: Message) => {
    if (history.current.has(message.messageId)) return null;
    if (message.chatId === idChatOpen) return null;

    const messageChatId = message.chatId === PUBLIC_GROUP_CHAT_ID ? PUBLIC_CHAT_ID : message.chatId;
    const isPollResult = message.messageType === ChatMessageType.POLL;
    let content;

    if (isPollResult) {
      content = createPollMessage();
    } else {
      content = createMessage(message);
    }

    return (
      <ChatPushAlert
        key={messageChatId}
        chatId={messageChatId}
        content={content}
        title={
          messageChatId === PUBLIC_CHAT_ID
            ? <span>{intl.formatMessage(intlMessages.appToastChatPublic)}</span>
            : <span>{intl.formatMessage(intlMessages.appToastChatPrivate)}</span>
        }
        alertDuration={ALERT_DURATION}
        layoutContextDispatch={layoutContextDispatch}
      />
    );
  };

  return pushAlertEnabled
    ? [
      shouldRenderChatAlerts && chatUnreadMessages.map(renderToast),
    ]
    : null;
};

const ChatAlertContainerGraphql: React.FC = () => {
  const {
    chatAudioAlerts,
    chatPushAlerts,
  } = useSettings(SETTINGS.APPLICATION) as {
    chatAudioAlerts: boolean;
    chatPushAlerts: boolean;
  };

  const skipSubscriptions = !chatPushAlerts && !chatAudioAlerts;
  const previousSkipSubscriptions = usePreviousValue(skipSubscriptions);
  const cursor = useRef(new Date());

  if (previousSkipSubscriptions && !skipSubscriptions) {
    cursor.current = new Date();
  }

  const { data: chatMessages } = useDeduplicatedSubscription<ChatMessageStreamResponse>(
    CHAT_MESSAGE_STREAM,
    {
      skip: skipSubscriptions,
      variables: {
        createdAt: cursor.current.toISOString(),
      },
    },
  );

  const idChatOpen = layoutSelect((i: Layout) => i.idChatOpen);
  const sidebarContent = layoutSelectInput((i: Input) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;
  const layoutContextDispatch = layoutDispatch();

  if (!(chatAudioAlerts || chatPushAlerts)) return null;

  const idChat = sidebarContentPanel === PANELS.CHAT ? idChatOpen : '';

  if (!chatMessages) return null;

  return (
    <ChatAlertGraphql
      audioAlertEnabled={chatAudioAlerts}
      idChatOpen={idChat}
      layoutContextDispatch={layoutContextDispatch}
      pushAlertEnabled={chatPushAlerts}
      chatUnreadMessages={chatMessages?.chat_message_stream ?? null}
    />
  );
};

export default ChatAlertContainerGraphql;
