import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import ActionsBar from './component';
import Service from './service';
import VideoService from '../video-dock/service';
import { shareScreen, unshareScreen, isVideoBroadcasting } from '../screenshare/service';

const ActionsBarContainer = props => <ActionsBar {...props} />;

export default withTracker(() => ({
  isUserPresenter: Service.isUserPresenter(),
  emojiList: Service.getEmojiList(),
  emojiSelected: Service.getEmoji(),
  handleEmojiChange: Service.setEmoji,
  handleExitVideo: () => VideoService.exitVideo(),
  handleJoinVideo: () => VideoService.joinVideo(),
  handleShareScreen: () => shareScreen(),
  handleUnshareScreen: () => unshareScreen(),
  isVideoBroadcasting: isVideoBroadcasting(),

}))(ActionsBarContainer);
