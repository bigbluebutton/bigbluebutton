import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import getFromUserSettings from '/imports/ui/services/users-settings';
import Auth from '/imports/ui/services/auth';
import VideoProvider from './component';
import VideoService from './service';

const VideoProviderContainer = ({ children, ...props }) => {
  const { users } = props;
  return (!users.length ? null : <VideoProvider {...props}>{children}</VideoProvider>);
};

export default withTracker(props => ({
  cursor: props.cursor,
  swapLayout: props.swapLayout,
  meetingId: VideoService.meetingId(),
  users: VideoService.getAllWebcamUsers(),
  userId: Auth.userID,
  sessionToken: VideoService.sessionToken(),
  enableVideoStats: getFromUserSettings('enableVideoStats', Meteor.settings.public.kurento.enableVideoStats),
  voiceBridge: VideoService.voiceBridge(),
}))(VideoProviderContainer);
