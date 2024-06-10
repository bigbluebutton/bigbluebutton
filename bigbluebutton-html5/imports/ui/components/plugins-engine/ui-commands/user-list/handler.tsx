import { useEffect } from 'react';
import {
  UserListFormCommandsEnum,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/user-list/form/enums';
import { layoutDispatch } from '../../../layout/context';
import { PANELS, ACTIONS } from '../../../layout/enums';

const PluginUserListUiCommandsHandler = () => {
  const layoutContextDispatch = layoutDispatch();

  const handleUserListOpen = () => {
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_NAVIGATION_IS_OPEN,
      value: true,
    });
  };

  const handleUserListClose = () => {
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_NAVIGATION_IS_OPEN,
      value: false,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: PANELS.NONE,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: false,
    });
  };

  useEffect(() => {
    window.addEventListener(UserListFormCommandsEnum.OPEN, handleUserListOpen);
    window.addEventListener(UserListFormCommandsEnum.CLOSE, handleUserListClose);

    return () => {
      window.addEventListener(UserListFormCommandsEnum.OPEN, handleUserListOpen);
      window.addEventListener(UserListFormCommandsEnum.OPEN, handleUserListClose);
    };
  }, []);
  return null;
};

export default PluginUserListUiCommandsHandler;
