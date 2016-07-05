import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import VideoDock from './component';

class VideoDockContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <VideoDock>
        {this.props.children}
      </VideoDock>
    );
  }
}

export default createContainer(() => {
  let data = {};
  return data;
}, VideoDockContainer);
