import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/common/modal/service';
import ScreenshareButton from './component';
import { isScreenSharingEnabled } from '/imports/ui/services/features';
import {
  isVideoBroadcasting,
  dataSavingSetting,
} from '/imports/ui/components/screenshare/service';

const ScreenshareButtonContainer = (props) => <ScreenshareButton {...props} />;

/*
 * All props, including the ones that are inherited from actions-bar
 * isVideoBroadcasting,
 * amIPresenter,
 * screenSharingCheck,
 * isMeteorConnected,
 * screenshareDataSavingSetting,
 */
export default withModalMounter(withTracker(() => ({
  isVideoBroadcasting: isVideoBroadcasting(),
  screenshareDataSavingSetting: dataSavingSetting(),
  enabled: isScreenSharingEnabled(),
}))(ScreenshareButtonContainer));
