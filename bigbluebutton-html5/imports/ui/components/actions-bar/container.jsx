import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import getFromUserSettings from '/imports/ui/services/users-settings';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import { makeCall } from '/imports/ui/services/api';
import ActionsBar from './component';
import Service from './service';
import VideoService from '../video-provider/service';
import { shareScreen, unshareScreen, isVideoBroadcasting } from '../screenshare/service';

import MediaService, { getSwapLayout } from '../media/service';

const ActionsBarContainer = props => <ActionsBar {...props} />;

export default withTracker(() => {
  Meetings.find({ meetingId: Auth.meetingID }).observeChanges({
    changed: (id, fields) => {
      if (fields.recordProp && fields.recordProp.recording) {
        this.window.parent.postMessage({ response: 'recordingStarted' }, '*');
      }

      if (fields.recordProp && !fields.recordProp.recording) {
        this.window.parent.postMessage({ response: 'recordingStopped' }, '*');
      }
    },
  });


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
    screenSharingCheck: getFromUserSettings('enableScreensharing', Meteor.settings.public.kurento.enableScreensharing),
    enableVideo: getFromUserSettings('enableVideo', Meteor.settings.public.kurento.enableVideo),
    createBreakoutRoom: Service.createBreakoutRoom,
    meetingIsBreakout: Service.meetingIsBreakout(),
    hasBreakoutRoom: Service.hasBreakoutRoom(),
    meetingName: Service.meetingName(),
    users: Service.users(),
    isLayoutSwapped: getSwapLayout(),
    toggleSwapLayout: MediaService.toggleSwapLayout,
    sendInvitation: Service.sendInvitation,
    getBreakouts: Service.getBreakouts,
    getUsersNotAssigned: Service.getUsersNotAssigned,
    handleTakePresenter: Service.takePresenterRole,
  };
})(ActionsBarContainer);
