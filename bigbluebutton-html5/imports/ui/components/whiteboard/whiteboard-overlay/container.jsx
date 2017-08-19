import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import WhiteboardOverlayService from './service';
import WhiteboardOverlay from './component';

const WhiteboardOverlayContainer = ({ ...props }) => {
  if (props.drawSettings) {
    return (
      <WhiteboardOverlay {...props} />
    );
  }
  return null;
};

export default createContainer(() => ({
  sendAnnotation: WhiteboardOverlayService.sendAnnotation,
  setTextShapeActiveId: WhiteboardOverlayService.setTextShapeActiveId,
  resetTextShapeValue: WhiteboardOverlayService.resetTextShapeValue,
  drawSettings: WhiteboardOverlayService.getWhiteboardToolbarValues(),
  userId: WhiteboardOverlayService.getCurrentUserId(),
}), WhiteboardOverlayContainer);


WhiteboardOverlayContainer.propTypes = {
  drawSettings: PropTypes.shape({
    // Annotation color
    color: PropTypes.number.isRequired,
    // Annotation thickness (not normalized)
    thickness: PropTypes.number.isRequired,
    // The name of the tool currently selected
    tool: PropTypes.string.isRequired,
    // Font size for the text shape
    textFontSize: PropTypes.number.isRequired,
    // Text shape value
    textShapeValue: PropTypes.string.isRequired,
  }),
};

WhiteboardOverlayContainer.defaultProps = {
  drawSettings: undefined,
};
