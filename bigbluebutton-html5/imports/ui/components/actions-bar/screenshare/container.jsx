import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';
import ScreenshareButton from './component';
import getFromUserSettings from '/imports/ui/services/users-settings';
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
  enabled: getFromUserSettings(
    'bbb_enable_screen_sharing',
    Meteor.settings.public.kurento.enableScreensharing,
  ),
}))(ScreenshareButtonContainer));
