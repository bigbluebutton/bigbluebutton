import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Audio from './component';

// import Service from './service';

class AudioContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Audio {...this.props}>
        {this.props.children}
      </Audio>
    );
  }
}

export default createContainer(() => {
  return {
    a: 'a',
  }
}, AudioContainer);
