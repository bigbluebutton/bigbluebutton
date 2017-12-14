import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import VideoDock from './component';
import VideoService from './service';

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
  users: VideoService.getAllUsers(),
}), VideoDockContainer);
