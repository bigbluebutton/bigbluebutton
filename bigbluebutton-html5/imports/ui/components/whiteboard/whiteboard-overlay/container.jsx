import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import WhiteboardOverlayService from './service';
import WhiteboardToolbarService from '../whiteboard-toolbar/service';
import WhiteboardOverlay from './component';

const WhiteboardOverlayContainer = (props) => {
  const { drawSettings } = props;
  if (Object.keys(drawSettings).length > 0) {
    return (
      <WhiteboardOverlay {...props} />
    );
  }
  return null;
};

export default withTracker(() => ({
  undoAnnotation: WhiteboardToolbarService.undoAnnotation,
  contextMenuHandler: WhiteboardOverlayService.contextMenuHandler,
  sendAnnotation: WhiteboardOverlayService.sendAnnotation,
  addAnnotationToDiscardedList: WhiteboardOverlayService.addAnnotationToDiscardedList,
  setTextShapeActiveId: WhiteboardOverlayService.setTextShapeActiveId,
  resetTextShapeSession: WhiteboardOverlayService.resetTextShapeSession,
  drawSettings: WhiteboardOverlayService.getWhiteboardToolbarValues(),
  userId: WhiteboardOverlayService.getCurrentUserId(),
  updateCursor: WhiteboardOverlayService.updateCursor,
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
