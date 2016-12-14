import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import FontControl from '/imports/api/FontControl';
import { tester } from '/imports/api/FontControl';

import Settings from './component';
import Service from './service';

class SettingsMenuContainer extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount () {
    console.log('####### Settings Container Will Mount ########');
  }

  componentWillUnmount() {
    console.log('####### Settings Container Unmounting ########');
  }

  render() {
    return (
      <Settings

        {...this.props}>
        {this.props.children}
      </Settings>
    );
  }
}

export default createContainer(() => {
  let data = Service.checkUserRoles();
  return data;
}, SettingsMenuContainer);
