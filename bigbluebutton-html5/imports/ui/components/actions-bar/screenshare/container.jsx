import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import ScreenshareButton from './component';
import { isScreenSharingEnabled } from '/imports/ui/services/features';
import { isScreenBroadcasting } from '/imports/ui/components/screenshare/service';
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
export default withTracker(() => ({
  isScreenBroadcasting: isScreenBroadcasting(),
  enabled: isScreenSharingEnabled(),
}))(ScreenshareButtonContainer);
