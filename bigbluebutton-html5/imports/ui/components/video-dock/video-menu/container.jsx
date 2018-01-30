import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Settings from '/imports/ui/services/settings';
import JoinVideoOptions from './component';
import VideoMenuService from './service';
import VideoService from '../service';

const JoinVideoOptionsContainer = props => <JoinVideoOptions {...props} />;

export default withTracker((params) => {
  const isSharingVideo = VideoMenuService.isSharingVideo();
  const isWaitingResponse = VideoService.isWaitingResponse();
  const isConnected = VideoService.isConnected();

  const videoSettings = Settings.video;
  const enableShare = !videoSettings.viewParticipantsWebcams;
  return {
    isSharingVideo,
    isWaitingResponse,
    isConnected,
    enableShare,
    handleJoinVideo: params.handleJoinVideo,
    handleCloseVideo: params.handleCloseVideo,
  };
})(JoinVideoOptionsContainer);
