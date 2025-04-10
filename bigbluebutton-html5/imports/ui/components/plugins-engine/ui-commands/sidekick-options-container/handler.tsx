import { useEffect } from 'react';
import {
  SidekickOptionsContainerEnum,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/sidekick-options-container/enums';
import logger from '/imports/startup/client/logger';

const PluginSidekickOptionsContainerUiCommandsHandler = () => {
  const handleSidekickOptionsContainerOpen = () => {
    logger.info({
      logCode: 'navigation_open_called_by_plugin',
    }, 'Plugin tried to open the navigation sidebar. Intentionally ignored.');
  };

  const handleSidekickOptionsContainerClose = () => {
    logger.info({
      logCode: 'navigation_close_called_by_plugin',
    }, 'Plugin tried to close the navigation sidebar. Intentionally ignored.');
  };

  useEffect(() => {
    window.addEventListener(SidekickOptionsContainerEnum.OPEN, handleSidekickOptionsContainerOpen);
    window.addEventListener(SidekickOptionsContainerEnum.CLOSE, handleSidekickOptionsContainerClose);

    return () => {
      window.removeEventListener(SidekickOptionsContainerEnum.OPEN, handleSidekickOptionsContainerOpen);
      window.removeEventListener(SidekickOptionsContainerEnum.CLOSE, handleSidekickOptionsContainerClose);
    };
  }, []);
  return null;
};

export default PluginSidekickOptionsContainerUiCommandsHandler;
