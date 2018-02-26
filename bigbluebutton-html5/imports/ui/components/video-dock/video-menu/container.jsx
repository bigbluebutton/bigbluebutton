import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { defineMessages, injectIntl } from 'react-intl';
import Settings from '/imports/ui/services/settings';
import mapUser from '/imports/ui/services/user/mapUser';
import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings/';
import Users from '/imports/api/users/';
import JoinVideoOptions from './component';
import VideoMenuService from './service';
import VideoService from '../service';

const intlMessages = defineMessages({
  joinVideo: {
    id: 'app.video.joinVideo',
    description: 'Join video button label',
  },
  leaveVideo: {
    id: 'app.video.leaveVideo',
    description: 'Leave video button label',
  },
  swapCam: {
    id: 'app.video.swapCam',
    description: 'Swap cam button label',
  },
  swapCamDesc: {
    id: 'app.video.swapCamDesc',
    description: 'Swap cam button description',
  },
});

const JoinVideoOptionsContainer = props => <JoinVideoOptions {...props} />;

export default injectIntl(withTracker(({ intl, handleJoinVideo, handleCloseVideo }) => {
  const isSharingVideo = VideoMenuService.isSharingVideo();
  const isWaitingResponse = VideoService.isWaitingResponse();
  const isConnected = VideoService.isConnected();

  const videoSettings = Settings.video;
  const enableShare = !videoSettings.viewParticipantsWebcams;
  const meeting = Meetings.findOne({ meetingId: Auth.meetingID });
  const LockCam = meeting.lockSettingsProp ? meeting.lockSettingsProp.disableCam : false;
  const webcamOnlyModerator = meeting.usersProp.webcamsOnlyForModerator;

  const user = Users.findOne({ userId: Auth.userID });
  const userLocked = mapUser(user).isLocked;

  const isConecting = (!isSharingVideo && isConnected);
  const isLocked = (LockCam && userLocked) || webcamOnlyModerator;
  const isDisabled = isLocked
      || isWaitingResponse
      || isConecting
      || enableShare;

  const baseName = Meteor.settings.public.app.basename;
  const videoItems = [
    {
      iconPath: `${baseName}/resources/images/video-menu/icon-swap.svg`,
      description: intl.formatMessage(intlMessages.swapCamDesc),
      label: intl.formatMessage(intlMessages.swapCam),
      disabled: false,
      click: () => {},
    },
    {
      iconPath: `${baseName}/resources/images/video-menu/icon-webcam-off.svg`,
      description: intl.formatMessage(intlMessages[isSharingVideo ? 'leaveVideo' : 'joinVideo']),
      label: intl.formatMessage(intlMessages[isSharingVideo ? 'leaveVideo' : 'joinVideo']),
      disabled: isDisabled,
      click: isSharingVideo ? handleCloseVideo : handleJoinVideo,
    },
  ];

  return {
    isSharingVideo,
    videoItems,
  };
})(JoinVideoOptionsContainer));
