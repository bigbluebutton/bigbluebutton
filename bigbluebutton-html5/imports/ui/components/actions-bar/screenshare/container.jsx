import React from 'react';
import ScreenshareButton from './component';
import { useIsScreenSharingEnabled } from '/imports/ui/services/features';
import { useIsScreenBroadcasting, useIsScreenGloballyBroadcasting } from '/imports/ui/components/screenshare/service';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';

const ScreenshareButtonContainer = (props) => {
  const { viewScreenshare: screenshareDataSavingSetting } = useSettings(SETTINGS.DATA_SAVING);
  const screenIsBroadcasting = useIsScreenBroadcasting();
  const { screenIsShared: isScreenGloballyBroadcasting } = useIsScreenGloballyBroadcasting();
  const enabled = useIsScreenSharingEnabled();
  return (
    <ScreenshareButton
      screenshareDataSavingSetting={screenshareDataSavingSetting}
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
 * isMeteorConnected,
 * screenshareDataSavingSetting,
 */
export default ScreenshareButtonContainer;
