import React, { useEffect } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import VideoProvider from './component';
import VideoService from './service';
import { withLayoutContext } from '/imports/ui/components/layout/context';

const VideoProviderContainer = ({ children, ...props }) => {
  const { streams, layoutContextDispatch } = props;

  useEffect(() => {
    layoutContextDispatch(
      {
        type: 'setUsersVideo',
        value: streams.length,
      },
    );
  }, [streams.length]);

  return (!streams.length ? null : <VideoProvider {...props}>{children}</VideoProvider>);
};

export default withTracker(props => ({
  swapLayout: props.swapLayout,
  streams: VideoService.getVideoStreams(),
  isUserLocked: VideoService.isUserLocked(),
}))(withLayoutContext(VideoProviderContainer));
