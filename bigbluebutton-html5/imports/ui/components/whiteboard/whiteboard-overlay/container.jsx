import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import WhiteboardOverlayService from './service';
import WhiteboardOverlay from './component';

const WhiteboardOverlayContainer = (props) => {
  if (Object.keys(props.drawSettings).length > 0) {
    return (
      <WhiteboardOverlay {...props} />
    );
  }
  return null;
};

export default withTracker(() => ({
  sendAnnotation: WhiteboardOverlayService.sendAnnotation,
  setTextShapeActiveId: WhiteboardOverlayService.setTextShapeActiveId,
  resetTextShapeSession: WhiteboardOverlayService.resetTextShapeSession,
  drawSettings: WhiteboardOverlayService.getWhiteboardToolbarValues(),
  userId: WhiteboardOverlayService.getCurrentUserId(),
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
