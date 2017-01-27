import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Settings from './component.jsx';

class SettingsContainer extends Component {
  render() {
    return (
      <Settings/>
    );
  }
}

export default createContainer(() => {
  return {
    a: 'a',
  };
}, SettingsContainer);

// SettingsContainer.defaultProps = defaultProps;
