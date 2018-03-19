import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import VideoProvider from './component';
import VideoService from './service';

const VideoProviderContainer = ({ children, ...props }) => <VideoProvider {...props}>{children}</VideoProvider>;

export default withTracker(() => ({
  meetingId: VideoService.meetingId(),
  userId: VideoService.userId(),
}))(VideoProviderContainer);
