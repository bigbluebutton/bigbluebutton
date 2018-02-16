import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import VideoProvider from './component';
import VideoService from '../video-dock/service';

const VideoProviderContainer = ({ children, ...props }) => <VideoProvider {...props}>{children}</VideoProvider>;

export default withTracker(() => {

  return {
    userId: VideoService.userId()
  };
})(VideoProviderContainer);
