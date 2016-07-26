import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import SlideService from './service';
import SlideControls from './component.jsx';

const propTypes = {
  //Number of current slide being displayed
  currentSlideNum: PropTypes.number.isRequired,

  //PresentationId of the current presentation
  presentationId: PropTypes.string.isRequired,

  //Is the user a presenter
  userIsPresenter: PropTypes.bool.isRequired,

  //Total number of slides in this presentation
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
    } = this.props;

    if (userIsPresenter) {
      //Only show controls if user is presenter
      return (
        <SlideControls
          currentSlideNum={currentSlideNum}
          numberOfSlides={numberOfSlides}
        />
      );
    } else {
      return null;
    }
  }
}

export default createContainer((params) => {
  const data = SlideService.getSlideData(params);
  return data;
}, SlideControlsContainer);

SlideControlsContainer.propTypes = propTypes;
