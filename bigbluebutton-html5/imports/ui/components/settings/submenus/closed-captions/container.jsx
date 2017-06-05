import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import ClosedCaptionsMenu from './component';
import Service from './service';

class ClosedCaptionsMenuContainer extends Component {
  render() {
    return (
      <ClosedCaptionsMenu {...this.props}>
        {this.props.children}
      </ClosedCaptionsMenu>
    );
  }
}

export default createContainer(() => Service.getClosedCaptionSettings(), ClosedCaptionsMenuContainer);
