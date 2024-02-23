import React, { useEffect, useRef } from 'react';
import { useSubscription } from '@apollo/client';
import { Meteor } from 'meteor/meteor';
import { isEqual } from 'radash';
import { defineMessages, useIntl } from 'react-intl';
import AudioService from '/imports/ui/components/audio/service';
import { layoutSelect, layoutSelectInput, layoutDispatch } from '/imports/ui/components/layout/context';
import { Input, Layout } from '/imports/ui/components/layout/layoutTypes';
import { PANELS } from '/imports/ui/components/layout/enums';
import { usePreviousValue } from '/imports/ui/components/utils/hooks';
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

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_ID = CHAT_CONFIG.public_id;

const ALERT_DURATION = 4000; // 4 seconds

interface ChatAlertContainerGraphqlProps {
  audioAlertEnabled: boolean;
  pushAlertEnabled: boolean;
}

interface ChatAlertGraphqlProps extends ChatAlertContainerGraphqlProps {
  idChatOpen: string;
  layoutContextDispatch: () => void;
  publicUnreadMessages: Array<Message> | null;
  privateUnreadMessages: Array<Message> | null;
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
  const prevPublicUnreadMessages = usePreviousValue(publicUnreadMessages);
  const prevPrivateUnreadMessages = usePreviousValue(privateUnreadMessages);
  const publicMessagesDidChange = !isEqual(prevPublicUnreadMessages, publicUnreadMessages);
  const privateMessagesDidChange = !isEqual(prevPrivateUnreadMessages, privateUnreadMessages);
  const shouldRenderPublicChatAlerts = publicMessagesDidChange && publicUnreadMessages;
  const shouldRenderPrivateChatAlerts = privateMessagesDidChange && privateUnreadMessages;

  useEffect(() => {
    let shouldPlayAudioAlert = false;

    if (shouldRenderPublicChatAlerts) {
      shouldPlayAudioAlert = publicUnreadMessages.some((m) => m.chatId !== idChatOpen);
    }
    if (shouldRenderPrivateChatAlerts && !shouldPlayAudioAlert) {
      shouldPlayAudioAlert = privateUnreadMessages.some((m) => m.chatId !== idChatOpen);
    }
    shouldPlayAudioAlert ||= document.hidden;

    if (audioAlertEnabled && shouldPlayAudioAlert) {
      AudioService.playAlertSound(`${Meteor.settings.public.app.cdn
        + Meteor.settings.public.app.basename
        + Meteor.settings.public.app.instanceId}`
        + '/resources/sounds/notify.mp3');
    }
  }, [publicUnreadMessages, privateUnreadMessages]);

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

  return pushAlertEnabled
    ? [
      shouldRenderPublicChatAlerts && publicUnreadMessages.map((message) => {
        if (message.chatId === idChatOpen) return null;

        const isPollResult = message.messageType === ChatMessageType.POLL;
        let content;

        if (isPollResult) {
          content = createPollMessage();
        } else {
          content = createMessage(message);
        }

        return (
          <ChatPushAlert
            key={PUBLIC_CHAT_ID}
            chatId={PUBLIC_CHAT_ID}
            content={content}
            title={<span>{intl.formatMessage(intlMessages.appToastChatPublic)}</span>}
            alertDuration={ALERT_DURATION}
            layoutContextDispatch={layoutContextDispatch}
          />
        );
      }),
      shouldRenderPrivateChatAlerts && privateUnreadMessages.map((message) => {
        if (message.chatId === idChatOpen) return null;

        const content = createMessage(message);

        return (
          <ChatPushAlert
            key={message.chatId}
            chatId={message.chatId}
            content={content}
            title={<span>{intl.formatMessage(intlMessages.appToastChatPrivate)}</span>}
            alertDuration={ALERT_DURATION}
            layoutContextDispatch={layoutContextDispatch}
          />
        );
      }),
    ]
    : null;
};

const ChatAlertContainerGraphql: React.FC<ChatAlertContainerGraphqlProps> = (props) => {
  const cursor = useRef(new Date());
  const { data: publicMessages } = useSubscription<PublicMessageStreamResponse>(
    CHAT_MESSAGE_PUBLIC_STREAM,
    { variables: { createdAt: cursor.current.toISOString() } },
  );
  const { data: privateMessages } = useSubscription<PrivateMessageStreamResponse>(
    CHAT_MESSAGE_PRIVATE_STREAM,
    { variables: { createdAt: cursor.current.toISOString() } },
  );

  const idChatOpen = layoutSelect((i: Layout) => i.idChatOpen);
  const sidebarContent = layoutSelectInput((i: Input) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;
  const layoutContextDispatch = layoutDispatch();

  const { audioAlertEnabled, pushAlertEnabled } = props;

  const idChat = sidebarContentPanel === PANELS.CHAT ? idChatOpen : '';

  if (!publicMessages && !privateMessages) return null;

  return (
    <ChatAlertGraphql
      audioAlertEnabled={audioAlertEnabled}
      idChatOpen={idChat}
      layoutContextDispatch={layoutContextDispatch}
      pushAlertEnabled={pushAlertEnabled}
      publicUnreadMessages={publicMessages?.chat_message_public_stream ?? null}
      privateUnreadMessages={privateMessages?.chat_message_private_stream ?? null}
    />
  );
};

export default ChatAlertContainerGraphql;
