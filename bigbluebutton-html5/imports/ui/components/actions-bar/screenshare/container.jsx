import React, { useEffect, useRef } from 'react';
import ScreenshareButton from './component';
import { useIsScreenSharingEnabled } from '/imports/ui/services/features';
import {
  useIsScreenBroadcasting,
  useIsScreenGloballyBroadcasting,
  useIsSharing,
  useSharingContentType,
  CONTENT_TYPE_SCREENSHARE,
  screenshareHasEnded,
} from '/imports/ui/components/screenshare/service';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import useLockContext from '/imports/ui/components/lock-viewers/hooks/useLockContext';

const ScreenshareButtonContainer = (props) => {
  const { viewScreenshare: screenshareDataSavingSetting } = useSettings(SETTINGS.DATA_SAVING);
  const screenIsBroadcasting = useIsScreenBroadcasting();
  const { screenIsShared: isScreenGloballyBroadcasting } = useIsScreenGloballyBroadcasting();
  const enabled = useIsScreenSharingEnabled();
  const { userLocks, isLocked } = useLockContext();
  const isScreenshareLocked = userLocks.userScreenshare;
  // True only when THIS client is personally sharing a screenshare (local state).
  const isSharing = useIsSharing();
  const sharingContentType = useSharingContentType();
  const amIPersonallySharing = isSharing && sharingContentType === CONTENT_TYPE_SCREENSHARE;

  const prevIsScreenshareLocked = useRef(isScreenshareLocked);
  useEffect(() => {
    if (!prevIsScreenshareLocked.current && isScreenshareLocked && amIPersonallySharing) {
      screenshareHasEnded();
    }
    prevIsScreenshareLocked.current = isScreenshareLocked;
  }, [isScreenshareLocked, amIPersonallySharing]);

  return (
    <ScreenshareButton
      screenshareDataSavingSetting={screenshareDataSavingSetting}
      isScreenBroadcasting={screenIsBroadcasting}
      isScreenGloballyBroadcasting={isScreenGloballyBroadcasting}
      enabled={enabled}
      isScreenshareLocked={isScreenshareLocked}
      isLocked={isLocked}
      amIPersonallySharing={amIPersonallySharing}
      {...props}
    />
  );
};

/*
 * All props, including the ones that are inherited from actions-bar
 * isScreenBroadcasting,
 * amIPresenter,
 * screenSharingCheck,
 * screenshareDataSavingSetting,
 */
export default ScreenshareButtonContainer;
