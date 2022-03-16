import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PresentationMenu from './component';
import FullscreenService from '/imports/ui/components/common/fullscreen-button/service';
import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings';
import { layoutSelect, layoutDispatch } from '/imports/ui/components/layout/context';

const PresentationMenuContainer = (props) => {
  const fullscreen = layoutSelect((i) => i.fullscreen);
  const { element: currentElement, group: currentGroup } = fullscreen;
  const layoutContextDispatch = layoutDispatch();

  return (
    <PresentationMenu
      {...props}
      {...{
        currentElement,
        currentGroup,
        layoutContextDispatch,
      }}
    />
  );
};

export default withTracker((props) => {
  const handleToggleFullscreen = (ref) => FullscreenService.toggleFullScreen(ref);
  const { isFullscreen } = props;
  const isIphone = !!(navigator.userAgent.match(/iPhone/i));
  const meetingId = Auth.meetingID;
  const meetingObject = Meetings.findOne({ meetingId }, { fields: { 'meetingProp.name': 1 } });

  return {
    ...props,
    handleToggleFullscreen,
    isIphone,
    isFullscreen,
    isDropdownOpen: Session.get('dropdownOpen'),
    meetingName: meetingObject.meetingProp.name,
  };
})(PresentationMenuContainer);
