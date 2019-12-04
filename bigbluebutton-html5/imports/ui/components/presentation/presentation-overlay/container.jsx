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

export default withTracker(() => {
  const drawSettings = WhiteboardToolbarService.getCurrentDrawSettings();
  const tool = drawSettings ? drawSettings.whiteboardAnnotationTool : '';

  return {
    annotationTool: tool,
  };
})(PresentationOverlayContainer);

PresentationOverlayContainer.propTypes = {
  children: PropTypes.node,
};

PresentationOverlayContainer.defaultProps = {
  children: undefined,
};
