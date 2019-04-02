import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import PresentationOverlayService from './service';
import PresentationToolbarService from '../presentation-toolbar/service';
import PresentationService from '../service';
import PresentationOverlay from './component';

const PresentationOverlayContainer = ({ children, ...rest }) => (
  <PresentationOverlay {...rest}>
    {children}
  </PresentationOverlay>
);

export default withTracker(({ podId, currentSlideNum, slide }) => ({
  slide,
  podId,
  currentSlideNum,
  updateCursor: PresentationOverlayService.updateCursor,
  zoomSlide: PresentationToolbarService.zoomSlide,
  isPresenter: PresentationService.isPresenter(podId),
}))(PresentationOverlayContainer);

PresentationOverlayContainer.propTypes = {
  children: PropTypes.node,
};

PresentationOverlayContainer.defaultProps = {
  children: undefined,
};
