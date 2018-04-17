import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import PresentationToolbarService from './service';
import PresentationToolbar from './component';

const PresentationToolbarContainer = (props) => {
  const {
    currentSlideNum,
    userIsPresenter,
    numberOfSlides,
    actions,
  } = props;

  if (userIsPresenter) {
    // Only show controls if user is presenter
    return (
      <PresentationToolbar
        currentSlideNum={currentSlideNum}
        numberOfSlides={numberOfSlides}
        actions={actions}
      />
    );
  }
  return null;
};

export default withTracker(({ presentationId, userIsPresenter, currentSlideNum }) => {
  const data = PresentationToolbarService.getSlideData(presentationId);

  const {
    numberOfSlides,
  } = data;

  return {
    userIsPresenter,
    numberOfSlides,
    actions: {
      nextSlideHandler: () =>
        PresentationToolbarService.nextSlide(currentSlideNum, numberOfSlides),
      previousSlideHandler: () =>
        PresentationToolbarService.previousSlide(currentSlideNum, numberOfSlides),
      skipToSlideHandler: event =>
        PresentationToolbarService.skipToSlide(event),
    },
  };
})(PresentationToolbarContainer);

PresentationToolbarContainer.propTypes = {
  // Number of current slide being displayed
  currentSlideNum: PropTypes.number.isRequired,

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
