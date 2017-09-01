import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';

import VideoDock from './component';
import VideoService from './service';
import Users from '/imports/api/2.0/users';

class VideoDockContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <VideoDock {...this.props}>
        {this.props.children}
      </VideoDock>
    );
  }
}

export default createContainer(() => ({
  sendUserShareWebcam: VideoService.sendUserShareWebcam,
  sendUserUnshareWebcam: VideoService.sendUserUnshareWebcam,
  users: Users.find().fetch(),
}), VideoDockContainer);
