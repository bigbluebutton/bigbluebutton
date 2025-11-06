import { useEffect } from 'react';
import {
  ChatFormCommandsEnum,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/chat/form/enums';
import {
  ChatUiCommandsEnum,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/chat/enums';
import {
  OpenPrivateChatCommandArguments,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/chat/types';
import { layoutDispatch } from '../../../layout/context';
import { PANELS, ACTIONS } from '../../../layout/enums';

const PluginChatUiCommandsHandler = () => {
  const layoutContextDispatch = layoutDispatch();

  const handleChatFormsOpen = () => {
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: true,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: PANELS.CHAT,
    });
  };

  const handleOpenPrivateChat = ((event: CustomEvent<OpenPrivateChatCommandArguments>) => {
    const { chatId } = event.detail;

    // Open the sidebar with chat panel
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: true,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: PANELS.CHAT,
    });

    // Set the specific chat to open
    layoutContextDispatch({
      type: ACTIONS.SET_ID_CHAT_OPEN,
      value: chatId,
    });
  }) as EventListener;

  useEffect(() => {
    window.addEventListener(ChatFormCommandsEnum.OPEN, handleChatFormsOpen);
    window.addEventListener(ChatUiCommandsEnum.OPEN_PRIVATE_CHAT, handleOpenPrivateChat);

    return () => {
      window.removeEventListener(ChatFormCommandsEnum.OPEN, handleChatFormsOpen);
      window.removeEventListener(ChatUiCommandsEnum.OPEN_PRIVATE_CHAT, handleOpenPrivateChat);
    };
  }, []);

  return null;
};

export default PluginChatUiCommandsHandler;
