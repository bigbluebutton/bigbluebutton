import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import VideoProvider from './component';
import VideoService from './service';
import { withLayoutContext } from '/imports/ui/components/layout/context';

const VideoProviderContainer = ({ children, ...props }) => {
  const { streams } = props;
  return (!streams.length ? null : <VideoProvider {...props}>{children}</VideoProvider>);
};

export default withTracker(props => ({
  swapLayout: props.swapLayout,
  streams: VideoService.getVideoStreams(),
  isUserLocked: VideoService.isUserLocked(),
}))(withLayoutContext(VideoProviderContainer));
