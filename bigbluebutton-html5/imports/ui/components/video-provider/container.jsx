import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import VideoProvider from './component';

const VideoProviderContainer = ({ children, ...props }) => <VideoProvider {...props}>{children}</VideoProvider>;

export default withTracker(() => {

  return {
  };
})(VideoProviderContainer);
