import { useEffect } from 'react';
import {
  ChatFormCommandsEnum,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/chat/form/enums';
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

  useEffect(() => {
    window.addEventListener(ChatFormCommandsEnum.OPEN, handleChatFormsOpen);

    return () => {
      window.addEventListener(ChatFormCommandsEnum.OPEN, handleChatFormsOpen);
    };
  }, []);
  return null;
};

export default PluginChatUiCommandsHandler;
