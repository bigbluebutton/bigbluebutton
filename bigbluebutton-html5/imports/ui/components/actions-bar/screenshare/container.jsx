import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import ScreenshareButton from './component';
import { isScreenSharingEnabled } from '/imports/ui/services/features';
import {
  isScreenBroadcasting,
  useIsSharing,
  useSharingContentType,
} from '/imports/ui/components/screenshare/service';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';

const ScreenshareButtonContainer = (props) => {
  const { viewScreenshare: screenshareDataSavingSetting } = useSettings(SETTINGS.DATA_SAVING);
  return (
    <ScreenshareButton screenshareDataSavingSetting={screenshareDataSavingSetting} {...props} />
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
const ScreenshareButtonContainerTracker = withTracker(({ isSharing, sharingContentType }) => ({
  isScreenBroadcasting: isScreenBroadcasting(isSharing, sharingContentType),
  enabled: isScreenSharingEnabled(),
}))(ScreenshareButtonContainer);

// TODO: Remove this
// Temporary component until we remove all trackers
export default (props) => {
  const isSharing = useIsSharing();
  const sharingContentType = useSharingContentType();
  return (
    <ScreenshareButtonContainerTracker
      {...{
        ...props,
        isSharing,
        sharingContentType,
      }}
    />
  );
};
