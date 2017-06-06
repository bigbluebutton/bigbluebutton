import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
  const data = {};
  return data;
}, VideoDockContainer);
