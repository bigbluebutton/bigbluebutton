import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ClosedCaptionsService from './service.js';
import ClosedCaptions from './component';

class ClosedCaptionsContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ClosedCaptions {...this.props}>
        {this.props.children}
      </ClosedCaptions>
    );
  }
}

export default createContainer(() => ClosedCaptionsService.getCCData(), ClosedCaptionsContainer);
