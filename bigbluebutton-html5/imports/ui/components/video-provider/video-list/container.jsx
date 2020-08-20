import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import VideoList from '/imports/ui/components/video-provider/video-list/component';
import VideoService from '/imports/ui/components/video-provider/service';

const VideoListContainer = ({ children, ...props }) => {
  const { streams } = props;
  return (!streams.length ? null : <VideoList{...props}>{children}</VideoList>);
};

export default withTracker(props => ({
  streams: props.streams,
  onMount: props.onMount,
  swapLayout: props.swapLayout,
  numberOfPages: VideoService.getNumberOfPages(),
  currentVideoPageIndex: props.currentVideoPageIndex,
}))(VideoListContainer);
