import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import PresentationService from '/imports/ui/components/presentation/service';
import MediaService from '/imports/ui/components/media/service';
import PresentationToolbar from './component';
import PresentationToolbarService from './service';

const PresentationToolbarContainer = (props) => {
  const {
    userIsPresenter,
    getSwapLayout,
  } = props;

  if (userIsPresenter && !getSwapLayout) {
    // Only show controls if user is presenter and layout isn't swapped

    return (
      <PresentationToolbar
        {...props}
      />
    );
  }
  return null;
};

export default withTracker((params) => {
  const {
    podId,
    presentationId,
    fitToWidth,
    fullscreenRef,
    zoom,
    zoomChanger,
    currentSlideNum,
    fitToWidthHandler,
  } = params;

  return {
    getSwapLayout: MediaService.getSwapLayout(),
    fitToWidthHandler,
    fitToWidth,
    fullscreenRef,
    userIsPresenter: PresentationService.isPresenter(podId),
    numberOfSlides: PresentationToolbarService.getNumberOfSlides(podId, presentationId),
    zoom,
    zoomChanger,
    currentSlideNum,
    nextSlide: PresentationToolbarService.nextSlide,
    previousSlide: PresentationToolbarService.previousSlide,
    skipToSlide: PresentationToolbarService.skipToSlide,
  };
})(PresentationToolbarContainer);

PresentationToolbarContainer.propTypes = {
  // Number of current slide being displayed
  currentSlideNum: PropTypes.number.isRequired,
  zoom: PropTypes.number.isRequired,
  zoomChanger: PropTypes.func.isRequired,

  // Is the user a presenter
  userIsPresenter: PropTypes.bool.isRequired,

  // Total number of slides in this presentation
  numberOfSlides: PropTypes.number.isRequired,

  // Actions required for the presenter toolbar
  nextSlide: PropTypes.func.isRequired,
  previousSlide: PropTypes.func.isRequired,
  skipToSlide: PropTypes.func.isRequired,
};
