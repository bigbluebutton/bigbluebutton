import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import WhiteboardOverlayService from './service';
import WhiteboardOverlay from './component';
import WhiteboardService from '../service';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import { makeCall } from '/imports/ui/services/api';

const WhiteboardOverlayContainer = (props) => {
  const { drawSettings } = props;
  
  // Updating the whiteboard mode for the breakout room.
  // Note that doing this when the breakout room is created is a more elegant solution,
  //  but it would be much complicated and there is a risk to break something else.
  const meeting = Meetings.findOne({meetingId: Auth.meetingID}, { fields: {meetingProp:1, visited:1}});
  if ( meeting.meetingProp.isBreakout && !meeting.visited ){
    WhiteboardService.setVisited(true);
    // The first one who enters the breakout room has to do this.
    // I decided to add the member "visited".
    // Another option is to check the number of users in the room,
    //  but there is a race condition where somebody enters before creating the whiteboard overlay.

    WhiteboardService.setWhiteboardMode(WhiteboardService.getWhiteboardMode(), {meetingId: Auth.meetingID, requesterUserId: Auth.userId});
    // We need this because the whiteboard mode set at the modifier API addMeeting.js has not reached to the akka-app.
  }
  
  if (Object.keys(drawSettings).length > 0) {
    return (
      <WhiteboardOverlay {...props} />
    );
  }
  return null;
};

export default withTracker(() => ({
  clearPreview: WhiteboardOverlayService.clearPreview,
  contextMenuHandler: WhiteboardOverlayService.contextMenuHandler,
  sendAnnotation: WhiteboardOverlayService.sendAnnotation,
  setTextShapeActiveId: WhiteboardOverlayService.setTextShapeActiveId,
  resetTextShapeSession: WhiteboardOverlayService.resetTextShapeSession,
  drawSettings: WhiteboardOverlayService.getWhiteboardToolbarValues(),
  userId: WhiteboardOverlayService.getCurrentUserId(),
  updateCursor: WhiteboardOverlayService.updateCursor,
  synchronizeWBUpdate: WhiteboardService.getWhiteboardMode().synchronizeWBUpdate,
}))(WhiteboardOverlayContainer);


WhiteboardOverlayContainer.propTypes = {
  drawSettings: PropTypes.oneOfType([
    PropTypes.shape({
      // Annotation color
      color: PropTypes.number.isRequired,
      // Annotation thickness (not normalized)
      thickness: PropTypes.number.isRequired,
      // The name of the tool currently selected
      tool: PropTypes.string.isRequired,
      // Font size for the text shape
      textFontSize: PropTypes.number.isRequired,
      // Current active text shape value
      textShapeValue: PropTypes.string.isRequired,
      // Text active text shape id
      textShapeActiveId: PropTypes.string.isRequired,
    }),
    PropTypes.object.isRequired,
  ]),
};

WhiteboardOverlayContainer.defaultProps = {
  drawSettings: {},
};
