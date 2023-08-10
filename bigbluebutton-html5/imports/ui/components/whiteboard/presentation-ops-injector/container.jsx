import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import PresentationOps from './component';
import FullscreenService from '/imports/ui/components/common/fullscreen-button/service';
import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings';
import WhiteboardService from '/imports/ui/components/whiteboard/service';
import UserService from '/imports/ui/components/user-list/service';

const PresentationOpsContainer = (props) => {
  const { elementId, isRTL, layoutContextDispatch, fullscreen } = props;
  const { element: currentElement, group: currentGroup } = fullscreen;
  const isFullscreen = currentElement === elementId;

  return (
    <PresentationOps
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
  const hasWBAccess = WhiteboardService.hasMultiUserAccess(
    WhiteboardService.getCurrentWhiteboardId(),
    Auth.userID
  );
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
})(PresentationOpsContainer);

PresentationOpsContainer.propTypes = {
  elementId: PropTypes.string.isRequired,
};
