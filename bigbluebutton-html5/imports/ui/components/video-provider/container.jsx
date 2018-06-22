import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import VideoProvider from './component';
import VideoService from './service';

const VideoProviderContainer = ({ children, ...props }) =>
  (!props.users.length ? null : <VideoProvider {...props}>{children}</VideoProvider>);

export default withTracker(() => ({
  meetingId: VideoService.meetingId(),
  users: VideoService.getAllUsersVideo(),
  userId: VideoService.userId(),
  enableVideoStats: Meteor.settings.public.kurento.enableVideoStats,
}))(VideoProviderContainer);
