import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import Settings from './component';
import Service from './service';

class SettingsMenuContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Settings {...this.props}>
        {this.props.children}
      </Settings>
    );
  }
}

export default createContainer(() => {
  let data = Service.checkUserRoles();
  return data;
}, SettingsMenuContainer);
