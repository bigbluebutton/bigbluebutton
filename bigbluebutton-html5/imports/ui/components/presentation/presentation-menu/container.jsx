import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import PresentationMenu from './component';
import FullscreenService from '/imports/ui/components/common/fullscreen-button/service';
import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings';
import { layoutSelect, layoutDispatch } from '/imports/ui/components/layout/context';
import WhiteboardService from '/imports/ui/components/whiteboard/service';
import UserService from '/imports/ui/components/user-list/service';

const PresentationMenuContainer = (props) => {
  const fullscreen = layoutSelect((i) => i.fullscreen);
  const { element: currentElement, group: currentGroup } = fullscreen;
  const layoutContextDispatch = layoutDispatch();
  const { elementId } = props;
  const isFullscreen = currentElement === elementId;
  const isRTL = layoutSelect((i) => i.isRTL);

  return (
    <PresentationMenu
      {...props}
      {...{
        currentElement,
        currentGroup,
        isFullscreen,
        layoutContextDispatch,
        isRTL,
      }}
    />
  );
};

export default withTracker((props) => {
  const handleToggleFullscreen = (ref) => FullscreenService.toggleFullScreen(ref);
  const isIphone = !!(navigator.userAgent.match(/iPhone/i));
  const meetingId = Auth.meetingID;
  const meetingObject = Meetings.findOne({ meetingId }, { fields: { 'meetingProp.name': 1 } });
  const hasWBAccess = WhiteboardService.hasMultiUserAccess(WhiteboardService.getCurrentWhiteboardId(), Auth.userID);
  const amIPresenter = UserService.isUserPresenter(Auth.userID);

  return {
    ...props,
    handleToggleFullscreen,
    isIphone,
    isDropdownOpen: Session.get('dropdownOpen'),
    meetingName: meetingObject.meetingProp.name,
    hasWBAccess,
    amIPresenter,
  };
})(PresentationMenuContainer);

PresentationMenuContainer.propTypes = {
  elementId: PropTypes.string.isRequired,
};
