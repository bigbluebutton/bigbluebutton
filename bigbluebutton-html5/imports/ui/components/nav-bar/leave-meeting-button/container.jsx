import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import deviceInfo from '/imports/utils/deviceInfo';
import LeaveMeetingButton from './component';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import { layoutSelectInput, layoutSelect } from '../../layout/context';
import { SMALL_VIEWPORT_BREAKPOINT } from '../../layout/enums';

const LeaveMeetingButtonContainer = (props) => {
  const { width: browserWidth } = layoutSelectInput((i) => i.browser);
  const isMobile = browserWidth <= SMALL_VIEWPORT_BREAKPOINT;
  const isRTL = layoutSelect((i) => i.isRTL);

  return (
    <LeaveMeetingButton {...{ isMobile, isRTL, ...props }} />
  );
};

export default withTracker((props) => {
  return {
    amIModerator: props.amIModerator,
    isMobile: deviceInfo.isMobile,
    isMeteorConnected: Meteor.status().connected,
    isBreakoutRoom: meetingIsBreakout(),
    isDropdownOpen: Session.get('dropdownOpen'),
  };
})(LeaveMeetingButtonContainer);
