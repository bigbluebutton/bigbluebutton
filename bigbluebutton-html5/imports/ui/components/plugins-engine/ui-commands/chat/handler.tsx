import { useEffect } from 'react';
import {
  ChatFormCommandsEnum,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/chat/form/enums';
import {
  OpenChatFormCommandArguments,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/chat/form/types';
import { layoutDispatch } from '../../../layout/context';
import { PANELS, ACTIONS } from '../../../layout/enums';

const PluginChatUiCommandsHandler = () => {
  const layoutContextDispatch = layoutDispatch();
  const PUBLIC_CHAT_ID = window.meetingClientSettings.public.chat.public_group_id;

  const handleChatFormsOpen = ((event: CustomEvent<OpenChatFormCommandArguments>) => {
    const { chatId } = event?.detail || { chatId: null };
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: true,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: PANELS.CHAT,
    });

    if (chatId !== null) {
      // Set the specific chat to open
      layoutContextDispatch({
        type: ACTIONS.SET_ID_CHAT_OPEN,
        value: chatId,
      });
    } else {
      layoutContextDispatch({
        type: ACTIONS.SET_ID_CHAT_OPEN,
        value: PUBLIC_CHAT_ID,
      });
    }
  }) as EventListener;

  useEffect(() => {
    window.addEventListener(ChatFormCommandsEnum.OPEN, handleChatFormsOpen);

    return () => {
      window.removeEventListener(ChatFormCommandsEnum.OPEN, handleChatFormsOpen);
    };
  }, []);

  return null;
};

export default PluginChatUiCommandsHandler;
