import React from 'react';
import ScreenshareButton from './component';
import { useIsScreenSharingEnabled } from '/imports/ui/services/features';
import { useIsScreenBroadcasting, useIsScreenGloballyBroadcasting, useScreenshare } from '/imports/ui/components/screenshare/service';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useMeeting from '/imports/ui/core/hooks/useMeeting';

const ScreenshareButtonContainer = (props) => {
  const { viewScreenshare: screenshareDataSavingSetting } = useSettings(SETTINGS.DATA_SAVING);
  const screenIsBroadcasting = useIsScreenBroadcasting();

  const { screenIsShared: isScreenGloballyBroadcasting } = useIsScreenGloballyBroadcasting();
  const enabled = useIsScreenSharingEnabled();
  const l = useScreenshare();
  const { data } = l;
  const {
    data: meetingData,
  } = useMeeting((m) => ({
    lockSettings: m.lockSettings,
  }));
  const viewersCanShareScreen = meetingData?.lockSettings?.viewersCanShareScreen;

  const {
    data: currentUserData,
  } = useCurrentUser((u) => ({
    userId: u.userId,
  }));

  const isUserSharedScreen = data && data.find((stream) => stream.userId === currentUserData?.userId);

  return (
    <ScreenshareButton
      screenshareDataSavingSetting={screenshareDataSavingSetting}
      isScreenBroadcasting={screenIsBroadcasting}
      isScreenGloballyBroadcasting={isScreenGloballyBroadcasting}
      enabled={enabled}
      streamId={(data || [])[0]?.streamId}
      isUserSharedScreen={isUserSharedScreen}
      viewersCanShareScreen={viewersCanShareScreen}
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
