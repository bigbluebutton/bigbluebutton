import { useEffect } from 'react';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { screenshareHasEnded, useIsScreenBroadcasting } from '/imports/ui/components/screenshare/service';
import { ScreenshareCommandsEnum } from 'bigbluebutton-html-plugin-sdk';
import logger from '/imports/startup/client/logger';

const PluginScreenshareUiCommandsHandler = () => {
  const { data: currentUserData } = useCurrentUser((user) => ({
    presenter: user.presenter,
  }));
  const isScreenBroadcasting = useIsScreenBroadcasting();

  useEffect(() => {
    const handleStopScreenshare = () => {
      const amIBroadcasting = isScreenBroadcasting && currentUserData?.presenter;
      if (!amIBroadcasting) {
        logger.warn({
          logCode: 'plugin_screenshare_stop_not_allowed',
        }, 'Plugin tried to stop screenshare but user is not broadcasting');
        return;
      }
      screenshareHasEnded();
    };

    window.addEventListener(ScreenshareCommandsEnum.STOP, handleStopScreenshare);

    return () => {
      window.removeEventListener(ScreenshareCommandsEnum.STOP, handleStopScreenshare);
    };
  }, [currentUserData, isScreenBroadcasting]);

  return null;
};

export default PluginScreenshareUiCommandsHandler;
