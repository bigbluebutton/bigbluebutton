import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';
import ActionsBar from './component';
import Service from './service';
import AudioService from '../audio/service';
import VideoService from '../video-dock/service';
import ScreenshareService from '../screenshare/service';

import AudioModal from '../audio/audio-modal/component';

const ActionsBarContainer = ({ children, ...props }) => (
  <ActionsBar {...props}>
    {children}
  </ActionsBar>
);

export default withModalMounter(createContainer(({ mountModal }) => {
  const isPresenter = Service.isUserPresenter();

  const handleExitAudio = () => AudioService.exitAudio();
  const handleOpenJoinAudio = () =>
    mountModal(<AudioModal handleJoinListenOnly={AudioService.joinListenOnly} />);
  const handleExitVideo = () => VideoService.exitVideo();
  const handleJoinVideo = () => VideoService.joinVideo();
  const handleShareScreen = () => ScreenshareService.shareScreen();
  const handleUnshareScreen = () => ScreenshareService.unshareScreen();
  const isVideoBroadcasting = () => ScreenshareService.isVideoBroadcasting();

  return {
    isUserPresenter: isPresenter,
    handleExitAudio,
    handleOpenJoinAudio,
    handleExitVideo,
    handleJoinVideo,
    handleShareScreen,
    handleUnshareScreen,
    isVideoBroadcasting
  };
}, ActionsBarContainer));
