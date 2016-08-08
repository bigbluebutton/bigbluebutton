import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import SlideControlsService from './service';
import SlideControls from './component.jsx';

const propTypes = {
  // Number of current slide being displayed
  currentSlideNum: PropTypes.number.isRequired,

  // PresentationId of the current presentation
  presentationId: PropTypes.string.isRequired,

  // Is the user a presenter
  userIsPresenter: PropTypes.bool.isRequired,

  // Total number of slides in this presentation
  numberOfSlides: PropTypes.number.isRequired,
};

class SlideControlsContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      currentSlideNum,
      presentationId,
      userIsPresenter,
      numberOfSlides,
      actions,
    } = this.props;

    if (userIsPresenter) {
      // Only show controls if user is presenter
      return (
        <SlideControls
          currentSlideNum={currentSlideNum}
          numberOfSlides={numberOfSlides}
          actions={actions}
        />
      );
    } else {
      return null;
    }
  }
}

export default createContainer((params) => {
  const data = SlideControlsService.getSlideData(params);

  const {
    userIsPresenter,
    numberOfSlides,
  } = data;

  return {
    userIsPresenter,
    numberOfSlides,
    actions: {
      nextSlideHandler: () =>
        SlideControlsService.nextSlide(params.currentSlideNum, numberOfSlides),
      previousSlideHandler: () =>
        SlideControlsService.previousSlide(params.currentSlideNum, numberOfSlides),
      skipToSlideHandler: (event) =>
        SlideControlsService.skipToSlide(event),
    },
  };
}, SlideControlsContainer);

SlideControlsContainer.propTypes = propTypes;
