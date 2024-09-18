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
  CHAT_MESSAGE_PRIVATE_STREAM,
  CHAT_MESSAGE_PUBLIC_STREAM,
  PublicMessageStreamResponse,
  PrivateMessageStreamResponse,
  Message,
} from './queries';
import ChatPushAlert from './push-alert/component';
import Styled from './styles';
import Service from './service';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';

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

const ALERT_DURATION = 4000; // 4 seconds

interface ChatAlertGraphqlProps {
  idChatOpen: string;
  layoutContextDispatch: () => void;
  publicUnreadMessages: Array<Message> | null;
  privateUnreadMessages: Array<Message> | null;
  audioAlertEnabled: boolean;
  pushAlertEnabled: boolean;
}

const ChatAlertGraphql: React.FC<ChatAlertGraphqlProps> = (props) => {
  const {
    audioAlertEnabled,
    idChatOpen,
    layoutContextDispatch,
    pushAlertEnabled,
    publicUnreadMessages,
    privateUnreadMessages,
  } = props;
  const intl = useIntl();
  const history = useRef(new Set<string>());
  const prevPublicUnreadMessages = usePreviousValue(publicUnreadMessages);
  const prevPrivateUnreadMessages = usePreviousValue(privateUnreadMessages);
  const publicMessagesDidChange = !isEqual(prevPublicUnreadMessages, publicUnreadMessages);
  const privateMessagesDidChange = !isEqual(prevPrivateUnreadMessages, privateUnreadMessages);
  const shouldRenderPublicChatAlerts = publicMessagesDidChange
    && !!publicUnreadMessages
    && publicUnreadMessages.length > 0;
  const shouldRenderPrivateChatAlerts = privateMessagesDidChange
    && !!privateUnreadMessages
    && privateUnreadMessages.length > 0;
  const shouldPlayAudioAlert = useCallback(
    (m: Message) => (m.chatId !== idChatOpen || document.hidden) && !history.current.has(m.messageId),
    [idChatOpen, history.current],
  );

  const CHAT_CONFIG = window.meetingClientSettings.public.chat;
  const PUBLIC_CHAT_ID = CHAT_CONFIG.public_id;
  const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;

  useEffect(() => {
    if (shouldRenderPublicChatAlerts) {
      publicUnreadMessages.forEach((m) => {
        history.current.add(m.messageId);
      });
    }
    if (shouldRenderPrivateChatAlerts) {
      privateUnreadMessages.forEach((m) => {
        history.current.add(m.messageId);
      });
    }
  });

  let playAudioAlert = false;

  if (shouldRenderPublicChatAlerts) {
    playAudioAlert = publicUnreadMessages.some(shouldPlayAudioAlert);
  }
  if (shouldRenderPrivateChatAlerts && !playAudioAlert) {
    playAudioAlert = privateUnreadMessages.some(shouldPlayAudioAlert);
  }

  if (audioAlertEnabled && playAudioAlert) {
    Service.playAlertSound();
  }

  const mapTextContent = (msg: Message) => {
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
      shouldRenderPublicChatAlerts && publicUnreadMessages.map(renderToast),
      shouldRenderPrivateChatAlerts && privateUnreadMessages.map(renderToast),
    ]
    : null;
};

const ChatAlertContainerGraphql: React.FC = () => {
  const cursor = useRef(new Date());
  const { data: publicMessages } = useDeduplicatedSubscription<PublicMessageStreamResponse>(
    CHAT_MESSAGE_PUBLIC_STREAM,
    { variables: { createdAt: cursor.current.toISOString() } },
  );
  const { data: privateMessages } = useDeduplicatedSubscription<PrivateMessageStreamResponse>(
    CHAT_MESSAGE_PRIVATE_STREAM,
    { variables: { createdAt: cursor.current.toISOString() } },
  );

  const {
    chatAudioAlerts,
    chatPushAlerts,
  } = useSettings(SETTINGS.APPLICATION) as {
    chatAudioAlerts: boolean;
    chatPushAlerts: boolean;
  };

  const idChatOpen = layoutSelect((i: Layout) => i.idChatOpen);
  const sidebarContent = layoutSelectInput((i: Input) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;
  const layoutContextDispatch = layoutDispatch();

  if (!(chatAudioAlerts || chatPushAlerts)) return null;

  const idChat = sidebarContentPanel === PANELS.CHAT ? idChatOpen : '';

  if (!publicMessages && !privateMessages) return null;

  return (
    <ChatAlertGraphql
      audioAlertEnabled={chatAudioAlerts}
      idChatOpen={idChat}
      layoutContextDispatch={layoutContextDispatch}
      pushAlertEnabled={chatPushAlerts}
      publicUnreadMessages={publicMessages?.chat_message_public_stream ?? null}
      privateUnreadMessages={privateMessages?.chat_message_private_stream ?? null}
    />
  );
};

export default ChatAlertContainerGraphql;
