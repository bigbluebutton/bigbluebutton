import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import ActionsBar from './component';
import Service from './service';

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
  let data = Service.isUserPresenter();
  return data;
}, ActionsBarContainer);
