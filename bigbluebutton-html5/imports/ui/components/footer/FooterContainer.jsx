import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Service from './service';
import getFromUserSettings from '/imports/ui/services/users-settings';
import {
  shareScreen,
  unshareScreen,
  isVideoBroadcasting,
  screenShareEndAlert,
  dataSavingSetting,
} from '../screenshare/service';

import FooterView from './FooterView';

const FooterContainer = props => (
  <FooterView
    {...props}
  />
);

export default withTracker(() => ({
  amIPresenter: Service.amIPresenter(),
  amIModerator: Service.amIModerator(),
  handleShareScreen: onFail => shareScreen(onFail),
  handleUnshareScreen: () => unshareScreen(),
  isVideoBroadcasting: isVideoBroadcasting(),
  screenSharingCheck: getFromUserSettings('bbb_enable_screen_sharing', Meteor.settings.public.kurento.enableScreensharing),
  screenShareEndAlert,
  isMeteorConnected: Meteor.status().connected,
  screenshareDataSavingSetting: dataSavingSetting(),
}))(FooterContainer);
