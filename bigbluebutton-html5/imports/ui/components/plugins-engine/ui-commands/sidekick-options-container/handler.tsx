import { useEffect } from 'react';
import {
  SidekickOptionsContainerEnum,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/sidekick-options-container/enums';
import { layoutDispatch } from '../../../layout/context';
import { PANELS, ACTIONS } from '../../../layout/enums';

const PluginSidekickOptionsContainerUiCommandsHandler = () => {
  const layoutContextDispatch = layoutDispatch();

  const handleSidekickOptionsContainerOpen = () => {
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_NAVIGATION_IS_OPEN,
      value: true,
    });
  };

  const handleSidekickOptionsContainerClose = () => {
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
    window.addEventListener(SidekickOptionsContainerEnum.OPEN, handleSidekickOptionsContainerOpen);
    window.addEventListener(SidekickOptionsContainerEnum.CLOSE, handleSidekickOptionsContainerClose);

    return () => {
      window.addEventListener(SidekickOptionsContainerEnum.OPEN, handleSidekickOptionsContainerOpen);
      window.addEventListener(SidekickOptionsContainerEnum.OPEN, handleSidekickOptionsContainerClose);
    };
  }, []);
  return null;
};

export default PluginSidekickOptionsContainerUiCommandsHandler;
