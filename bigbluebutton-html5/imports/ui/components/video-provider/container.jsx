import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import getFromUserSettings from '/imports/ui/services/users-settings';
import VideoProvider from './component';
import VideoService from './service';

const VideoProviderContainer = ({ children, ...props }) => {
  const { users } = props;
  return (!users.length ? null : <VideoProvider {...props}>{children}</VideoProvider>);
};

export default withTracker(() => ({
  meetingId: VideoService.meetingId(),
  users: VideoService.getAllUsersVideo(),
  userId: VideoService.userId(),
  sessionToken: VideoService.sessionToken(),
  userName: VideoService.userName(),
  enableVideoStats: getFromUserSettings('enableVideoStats', Meteor.settings.public.kurento.enableVideoStats),
  voiceBridge: VideoService.voiceBridge(),
}))(VideoProviderContainer);
