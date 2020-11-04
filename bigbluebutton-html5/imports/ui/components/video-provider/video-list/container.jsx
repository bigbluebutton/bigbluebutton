import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import VideoList from '/imports/ui/components/video-provider/video-list/component';
import VideoService from '/imports/ui/components/video-provider/service';
import UserListService from '/imports/ui/components/user-list/service';

const VideoListContainer = ({ children, ...props }) => <VideoList {...props}>{children}</VideoList>;
export default withTracker(props => ({
  streams: props.streams,
  onMount: props.onMount,
  swapLayout: props.swapLayout,
  numberOfPages: VideoService.getNumberOfPages(),
  currentVideoPageIndex: props.currentVideoPageIndex,
  users: UserListService.getUsers(),
}))(VideoListContainer);
