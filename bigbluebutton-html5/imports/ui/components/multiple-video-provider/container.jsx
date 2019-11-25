import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import VideoProvider from './component';
import VideoService from './service';

const VideoProviderContainer = ({ children, ...props }) => {
  const { users } = props;
  return (!users.length ? null : <VideoProvider {...props}>{children}</VideoProvider>);
};

export default withTracker(props => ({
  swapLayout: props.swapLayout,
  users: VideoService.getAllWebcamUsers(),
  isUserLocked: VideoService.isUserLocked(),
}))(VideoProviderContainer);
