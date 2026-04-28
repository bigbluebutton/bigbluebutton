import { useEffect } from 'react';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { screenshareHasEnded, useIsScreenBroadcasting } from '/imports/ui/components/screenshare/service';

const STOP_SCREENSHARE_COMMAND = 'STOP_SCREENSHARE_COMMAND';

const PluginScreenshareUiCommandsHandler = () => {
  const { data: currentUserData } = useCurrentUser((user) => ({
    presenter: user.presenter,
  }));
  const isScreenBroadcasting = useIsScreenBroadcasting();

  useEffect(() => {
    const handleStopScreenshare = () => {
      const amIBroadcasting = isScreenBroadcasting && currentUserData?.presenter;
      if (!amIBroadcasting) return;
      screenshareHasEnded();
    };

    window.addEventListener(STOP_SCREENSHARE_COMMAND, handleStopScreenshare);

    return () => {
      window.removeEventListener(STOP_SCREENSHARE_COMMAND, handleStopScreenshare);
    };
  }, [currentUserData, isScreenBroadcasting]);

  return null;
};

export default PluginScreenshareUiCommandsHandler;
