import React from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { defineMessages, useIntl } from 'react-intl';
import { GET_CHAT_DATA, GetChatDataResponse, CLOSE_PRIVATE_CHAT_MUTATION } from './queries';
import closePrivateChat from './services';
import { layoutSelect, layoutDispatch } from '../../../layout/context';
import { useShortcut } from '../../../../core/hooks/useShortcut';
import { Layout } from '../../../layout/layoutTypes';
import { ACTIONS, PANELS } from '../../../layout/enums';
import ChatActions from './chat-actions/component';
import { ChatHeader as Header } from '../chat-message-list/page/chat-message/styles';

interface ChatHeaderProps {
  chatId: string;
  isPublicChat: boolean;
  title: string;
  isRTL: boolean;
}

const intlMessages = defineMessages({
  closeChatLabel: {
    id: 'app.chat.closeChatLabel',
    description: 'aria-label for closing chat button',
  },
  hideChatLabel: {
    id: 'app.chat.hideChatLabel',
    description: 'aria-label for hiding chat button',
  },
  titlePublic: {
    id: 'app.chat.titlePublic',
    description: 'Public chat title',
  },
  titlePrivate: {
    id: 'app.chat.titlePrivate',
    description: 'Private chat title',
  },
});

const ChatHeader: React.FC<ChatHeaderProps> = ({
  chatId, isPublicChat, title, isRTL,
}) => {
  const HIDE_CHAT_AK = useShortcut('hideprivatechat');
  const CLOSE_CHAT_AK = useShortcut('closeprivatechat');
  const layoutContextDispatch = layoutDispatch();
  const intl = useIntl();
  const [updateVisible] = useMutation(CLOSE_PRIVATE_CHAT_MUTATION);
  return (
    <Header
      isRTL={isRTL}
      data-test="chatTitle"
      leftButtonProps={{
        accessKey: chatId !== 'public' ? HIDE_CHAT_AK : null,
        'aria-label': intl.formatMessage(intlMessages.hideChatLabel, { chatName: title }),
        'data-test': isPublicChat ? 'hidePublicChat' : 'hidePrivateChat',
        label: title,
        onClick: () => {
          layoutContextDispatch({
            type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
            value: false,
          });
          layoutContextDispatch({
            type: ACTIONS.SET_ID_CHAT_OPEN,
            value: '',
          });
          layoutContextDispatch({
            type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
            value: PANELS.NONE,
          });
        },
      }}
      rightButtonProps={{
        accessKey: CLOSE_CHAT_AK,
        'aria-label': intl.formatMessage(intlMessages.closeChatLabel, { chatName: title }),
        'data-test': 'closePrivateChat',
        icon: 'close',
        label: intl.formatMessage(intlMessages.closeChatLabel, { chatName: title }),
        onClick: () => {
          updateVisible({ variables: { chatId, visible: false } });
          closePrivateChat(chatId);
          layoutContextDispatch({
            type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
            value: false,
          });
          layoutContextDispatch({
            type: ACTIONS.SET_ID_CHAT_OPEN,
            value: '',
          });
          layoutContextDispatch({
            type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
            value: PANELS.NONE,
          });
        },
      }}
      customRightButton={isPublicChat ? <ChatActions /> : null}
    />
  );
};

const isChatResponse = (data: unknown): data is GetChatDataResponse => {
  return (data as GetChatDataResponse).chat !== undefined;
};

const ChatHeaderContainer: React.FC = () => {
  const intl = useIntl();
  const idChatOpen = layoutSelect((i: Layout) => i.idChatOpen);
  const isRTL = layoutSelect((i: Layout) => i.isRTL);

  const {
    data: chatData,
    loading: chatDataLoading,
    error: chatDataError,
  } = useQuery<GetChatDataResponse>(GET_CHAT_DATA, {
    variables: { chatId: idChatOpen },
  });

  if (chatDataLoading) return null;
  if (chatDataError) {
    return (
      <div>
        Error:
        {JSON.stringify(chatDataError)}
      </div>
    );
  }
  if (!isChatResponse(chatData)) {
    return (
      <div>
        Error:
        {JSON.stringify(chatData)}
      </div>
    );
  }
  const isPublicChat = chatData.chat[0]?.public;
  const title = isPublicChat ? intl.formatMessage(intlMessages.titlePublic)
    : intl.formatMessage(intlMessages.titlePrivate, { participantName: chatData?.chat[0]?.participant?.name });
  return (
    <>
      <h2 className="sr-only">{title}</h2>
      <ChatHeader
        chatId={idChatOpen}
        isPublicChat={isPublicChat}
        title={title}
        isRTL={isRTL}
      />
    </>
  );
};

export default ChatHeaderContainer;
