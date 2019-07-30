import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import PresentationOverlay from './component';
import WhiteboardToolbarService from '../../whiteboard/whiteboard-toolbar/service';

const PresentationOverlayContainer = ({ children, ...rest }) => (
  <PresentationOverlay {...rest}>
    {children}
  </PresentationOverlay>
);

export default withTracker(({ podId, currentSlideNum, slide }) => {
  const drawSettings = WhiteboardToolbarService.getCurrentDrawSettings();
  const tool = drawSettings ? drawSettings.whiteboardAnnotationTool : '';

  return {
    slide,
    podId,
    currentSlideNum,
    annotationTool: tool,
  };
})(PresentationOverlayContainer);

PresentationOverlayContainer.propTypes = {
  children: PropTypes.node,
};

PresentationOverlayContainer.defaultProps = {
  children: undefined,
};
