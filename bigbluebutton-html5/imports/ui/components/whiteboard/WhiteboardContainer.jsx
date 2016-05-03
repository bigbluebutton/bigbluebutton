import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import Whiteboard from './Whiteboard.jsx';

class WhiteboardContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Whiteboard>
        {this.props.children}
      </Whiteboard>
    );
  }
}

export default createContainer(() => {
  return {};
}, WhiteboardContainer);
