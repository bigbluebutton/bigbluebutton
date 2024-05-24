import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import ScreenshareButton from './component';
import { isScreenSharingEnabled } from '/imports/ui/services/features';
import {
  isScreenBroadcasting,
  dataSavingSetting,
  useIsSharing,
  useSharingContentType,
} from '/imports/ui/components/screenshare/service';

const ScreenshareButtonContainer = (props) => <ScreenshareButton {...props} />;

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
  screenshareDataSavingSetting: dataSavingSetting(),
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
