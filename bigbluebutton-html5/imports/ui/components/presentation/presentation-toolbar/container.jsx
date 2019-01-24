import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import PresentationService from '/imports/ui/components/presentation/service';
import MediaService from '/imports/ui/components/media/service';
import PresentationToolbarService from './service';
import PresentationToolbar from './component';

const PresentationToolbarContainer = (props) => {
  const {
    currentSlideNum,
    userIsPresenter,
    numberOfSlides,
    actions,
    zoom,
    zoomChanger,
    fitToWidthHandler,
    getSwapLayout,
  } = props;

  if (userIsPresenter && !getSwapLayout) {
    // Only show controls if user is presenter and layout isn't swapped

    return (
      <PresentationToolbar
        {...{
          currentSlideNum,
          numberOfSlides,
          actions,
          zoom,
          zoomChanger,
          fitToWidthHandler,
        }}
      />
    );
  }
  return null;
};

export default withTracker((params) => {
  const { podId, presentationId } = params;
  const data = PresentationToolbarService.getSlideData(podId, presentationId);

  const {
    numberOfSlides,
  } = data;

  return {
    getSwapLayout: MediaService.getSwapLayout(),
    fitToWidthHandler: params.fitToWidthHandler,
    userIsPresenter: PresentationService.isPresenter(podId),
    numberOfSlides,
    zoom: params.zoom,
    zoomChanger: params.zoomChanger,
    actions: {
      nextSlideHandler: () => PresentationToolbarService.nextSlide(
        params.currentSlideNum,
        numberOfSlides,
        podId,
      ),
      previousSlideHandler: () => PresentationToolbarService.previousSlide(
        params.currentSlideNum,
        podId,
      ),
      skipToSlideHandler: requestedSlideNum => PresentationToolbarService.skipToSlide(
        requestedSlideNum,
        podId,
      ),
      zoomSlideHandler: value => PresentationToolbarService.zoomSlide(
        params.currentSlideNum,
        podId,
        value,
      ),
    },
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
  actions: PropTypes.shape({
    nextSlideHandler: PropTypes.func.isRequired,
    previousSlideHandler: PropTypes.func.isRequired,
    skipToSlideHandler: PropTypes.func.isRequired,
  }).isRequired,
};
