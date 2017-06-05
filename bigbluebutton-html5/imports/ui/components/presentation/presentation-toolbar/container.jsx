import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';

import PresentationToolbarService from './service';
import PresentationToolbar from './component.jsx';

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

class PresentationToolbarContainer extends React.Component {
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
        <PresentationToolbar
          currentSlideNum={currentSlideNum}
          numberOfSlides={numberOfSlides}
          actions={actions}
        />
      );
    }
    return null;
  }
}

export default createContainer((params) => {
  const data = PresentationToolbarService.getSlideData(params);

  const {
    userIsPresenter,
    numberOfSlides,
  } = data;

  return {
    userIsPresenter,
    numberOfSlides,
    actions: {
      nextSlideHandler: () =>
        PresentationToolbarService.nextSlide(params.currentSlideNum, numberOfSlides),
      previousSlideHandler: () =>
        PresentationToolbarService.previousSlide(params.currentSlideNum, numberOfSlides),
      skipToSlideHandler: event =>
        PresentationToolbarService.skipToSlide(event),
    },
  };
}, PresentationToolbarContainer);

PresentationToolbarContainer.propTypes = propTypes;
