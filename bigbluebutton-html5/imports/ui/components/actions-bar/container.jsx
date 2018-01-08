import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ActionsBar from './component';
import Service from './service';
import VideoService from '../video-dock/service';
import ScreenshareService from '../screenshare/service';

const ActionsBarContainer = props => <ActionsBar {...props} />;

export default createContainer(() => ({
  isUserPresenter: Service.isUserPresenter(),
  emojiList: Service.getEmojiList(),
  emojiSelected: Service.getEmoji(),
  handleEmojiChange: Service.setEmoji,
  handleExitVideo: () => VideoService.exitVideo(),
  handleJoinVideo: () => VideoService.joinVideo(),
  handleShareScreen: () =>  ScreenshareService.shareScreen(),
  handleUnshareScreen: () => ScreenshareService.unshareScreen(),
  isVideoBroadcasting: () => ScreenshareService.isVideoBroadcasting(),

}), ActionsBarContainer);
