import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import Actionsbar from './Actionsbar.jsx';

class ActionsbarContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Actionsbar {...this.props}>
        {this.props.children}
      </Actionsbar>
    );
  }
}

export default createContainer(() => {
  return {};
}, ActionsbarContainer);
