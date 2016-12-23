import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import ParticipantsMenu from './component';
import Service from './service';

class ParticipantsMenuContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ParticipantsMenu {...this.props}>
        {this.props.children}
      </ParticipantsMenu>
    );
  }
}

export default createContainer(() => {
  let data = Service.checkUserRoles();
  return data;
}, ParticipantsMenuContainer);
