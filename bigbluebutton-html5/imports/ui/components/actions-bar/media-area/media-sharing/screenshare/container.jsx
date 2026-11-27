import React from 'react';
import ScreenshareButton from './component';
import { useIsScreenSharingEnabled } from '/imports/ui/services/features';
import { useIsScreenBroadcasting, useIsScreenGloballyBroadcasting } from '/imports/ui/components/screenshare/service';

const ScreenshareButtonContainer = (props) => {
  const screenIsBroadcasting = useIsScreenBroadcasting();
  const { screenIsShared: isScreenGloballyBroadcasting } = useIsScreenGloballyBroadcasting();
  const enabled = useIsScreenSharingEnabled();
  return (
    <ScreenshareButton
      isScreenBroadcasting={screenIsBroadcasting}
      isScreenGloballyBroadcasting={isScreenGloballyBroadcasting}
      enabled={enabled}
      {...props}
    />
  );
};

/*
 * All props, including the ones that are inherited from actions-bar
 * isScreenBroadcasting,
 * amIPresenter,
 * screenSharingCheck,
 * isConnected,
 */
export default ScreenshareButtonContainer;
