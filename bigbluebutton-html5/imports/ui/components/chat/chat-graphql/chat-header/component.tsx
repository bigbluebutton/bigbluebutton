import React, { useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { defineMessages, useIntl } from 'react-intl';
import { GET_CHAT_DATA, GetChatDataResponse, CLOSE_PRIVATE_CHAT_MUTATION } from './queries';
import { layoutSelect, layoutDispatch } from '/imports/ui/components/layout/context';
import { useShortcut } from '/imports/ui/core/hooks/useShortcut';
import { Layout } from '/imports/ui/components/layout/layoutTypes';
import { PANELS } from '/imports/ui/components/layout/enums';
import PanelHeader from '/imports/ui/components/common/panel-header/component';
import Styled from './styles';

interface ChatHeaderProps {
  chatId: string;
  isPublicChat: boolean;
  title: string;
}

const intlMessages = defineMessages({
  genericMinimizePanel: {
    id: 'app.sidebarContent.minimizePanelLabel',
    description: 'Generic minimize label for panels',
  },
  messagesTitle: {
    id: 'app.userList.messagesTitle',
    description: 'Title for the messages list',
  },

});

const ChatHeader: React.FC<ChatHeaderProps> = ({
  chatId, isPublicChat, title,
}) => {
  const HIDE_CHAT_AK = useShortcut('hideprivatechat');
  const layoutContextDispatch = layoutDispatch();
  const [updateVisible] = useMutation(CLOSE_PRIVATE_CHAT_MUTATION);

  const onBeforeClose = useCallback(() => {
    updateVisible({ variables: { chatId, visible: false } });
  }, [updateVisible, layoutContextDispatch, chatId]);

  return (
    <PanelHeader
      panelId={PANELS.CHAT}
      title={title}
      dataTest="chatTitle"
      closeButtonDataTest={isPublicChat ? 'hidePublicChat' : 'hidePrivateChat'}
      closeButtonProps={{ accessKey: HIDE_CHAT_AK }}
      onBeforeClose={onBeforeClose}
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
    <>
      <h2 className="sr-only">{title}</h2>
      <ChatHeader
        chatId={idChatOpen}
        isPublicChat={isPublicChat}
        title={title}
      />
    </>
  );
};

export default ChatHeaderContainer;
