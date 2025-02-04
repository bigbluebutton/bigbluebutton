import React from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { defineMessages, useIntl } from 'react-intl';
import { GET_CHAT_DATA, GetChatDataResponse, CLOSE_PRIVATE_CHAT_MUTATION } from './queries';
import { layoutSelect, layoutDispatch } from '../../../layout/context';
import { useShortcut } from '../../../../core/hooks/useShortcut';
import { Layout } from '../../../layout/layoutTypes';
import { ACTIONS, PANELS } from '../../../layout/enums';
import Styled from './styles';

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
  messagesTitle: {
    id: 'app.userList.messagesTitle',
    description: 'Title for the messages list',
  },
});

const ChatHeader: React.FC<ChatHeaderProps> = ({
  chatId, isPublicChat, title, isRTL,
}) => {
  const HIDE_CHAT_AK = useShortcut('hideprivatechat');
  const layoutContextDispatch = layoutDispatch();
  const intl = useIntl();
  const [updateVisible] = useMutation(CLOSE_PRIVATE_CHAT_MUTATION);

  return (
    <Styled.HeaderContainer
      isRTL={isRTL}
      data-test="chatTitle"
      title={title}
      leftButtonProps={{}}
      rightButtonProps={{
        accessKey: HIDE_CHAT_AK,
        'aria-label': intl.formatMessage(intlMessages.hideChatLabel, { 0: title }),
        'data-test': 'hidePrivateChat',
        icon: 'minus',
        label: intl.formatMessage(intlMessages.hideChatLabel, { 0: title }),
        onClick: () => {
          updateVisible({ variables: { chatId, visible: false } });
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
      customRightButton={isPublicChat ? <Styled.ChatActionsContainer /> : null}
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
  const title = intl.formatMessage(intlMessages.messagesTitle);

  return (
    <ChatHeader
      chatId={idChatOpen}
      isPublicChat={isPublicChat}
      title={title}
      isRTL={isRTL}
    />
  );
};

export default ChatHeaderContainer;
