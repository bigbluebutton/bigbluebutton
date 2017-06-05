import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import PresentationAreaService from './service';
import PresentationArea from './component';

class PresentationAreaContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <PresentationArea {...this.props}>
        {this.props.children}
      </PresentationArea>
    );
  }
}

export default createContainer(() => ({
  currentSlide: PresentationAreaService.getCurrentSlide(),
  cursor: PresentationAreaService.getCurrentCursor(),
  userIsPresenter: PresentationAreaService.isPresenter(),
}), PresentationAreaContainer);
