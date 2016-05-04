import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import ActionsBar from './ActionsBar.jsx';

class ActionsBarContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ActionsBar {...this.props}>
        {this.props.children}
      </ActionsBar>
    );
  }
}

export default createContainer(() => {
  return {};
}, ActionsBarContainer);
