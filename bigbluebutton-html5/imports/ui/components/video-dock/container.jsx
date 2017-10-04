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
      <div>
        <VideoDock updateData={this.props.updateData}>
          {this.props.children}
        </VideoDock>
      </div>
    );
  }
}

export default createContainer(() => {
  const data = {};
  return data;
}, VideoDockContainer);
