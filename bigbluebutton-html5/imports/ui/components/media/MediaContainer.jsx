import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import Media from './Media.jsx';

class MediaContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Media {...this.props}>
        {this.props.children}
      </Media>
    );
  }
}

export default createContainer(() => {
  return {};
}, MediaContainer);
