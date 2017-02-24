import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Audio from './component';

class AudioContainer extends Component {
  render() {
    return (
      <Audio {...this.props}>
        {this.props.children}
      </Audio>
    );
  }
}

export default createContainer(() => {
  return {};
}, AudioContainer);
