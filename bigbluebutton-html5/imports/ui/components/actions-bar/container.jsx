import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import ActionsBar from './component';
import Service from './service';
import VideoService from '../video-provider/service';
import { shareScreen, unshareScreen, isVideoBroadcasting } from '../screenshare/service';
import { withRouter } from 'react-router';

const ActionsBarContainer = props => <ActionsBar {...props} />;

export default withRouter(withTracker(({ location, router }) => {
  const togglePollMenu = () => {
    if (location.pathname.indexOf('/poll') !== -1) {
      router.push('/');
    } else {
      router.push('/users/poll');
    }
  };

  return {
    isUserPresenter: Service.isUserPresenter(),
    isUserModerator: Service.isUserModerator(),
    handleExitVideo: () => VideoService.exitVideo(),
    handleJoinVideo: () => VideoService.joinVideo(),
    handleShareScreen: onFail => shareScreen(onFail),
    handleUnshareScreen: () => unshareScreen(),
    isVideoBroadcasting: isVideoBroadcasting(),
    recordSettingsList: Service.recordSettingsList(),
    toggleRecording: Service.toggleRecording,
    togglePollMenu,
  };
})(ActionsBarContainer));
