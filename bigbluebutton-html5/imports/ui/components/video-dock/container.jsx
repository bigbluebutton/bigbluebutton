import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import VideoDock from './component';
import VideoService from './service';

const VideoDockContainer = ({ children, ...props }) => (
  <VideoDock {...props}>
    {children}
  </VideoDock>
);

export default withTracker(() => ({
  users: VideoService.getAllUsers(),
  userId: VideoService.userId(),
}))(VideoDockContainer);
