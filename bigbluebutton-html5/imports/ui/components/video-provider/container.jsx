import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import getFromUserSettings from '/imports/ui/services/users-settings';
import Users from '/imports/api/users';
import VideoStreams from '/imports/api/video-streams';
import Auth from '/imports/ui/services/auth';
import VideoProvider from './component';
import VideoService from './service';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;
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
  userIsLocked: !!Users.findOne({
    userId: Auth.userID,
    locked: true,
    role: { $ne: ROLE_MODERATOR },
  }, { fields: {} }) && VideoService.webcamsLocked(),
  userHasStream: !!VideoStreams.findOne({ userId: Auth.userID }, { fields: {} }),
  sessionToken: VideoService.sessionToken(),
  enableVideoStats: getFromUserSettings('bbb_enable_video_stats', Meteor.settings.public.kurento.enableVideoStats),
  voiceBridge: VideoService.voiceBridge(),
}))(VideoProviderContainer);
