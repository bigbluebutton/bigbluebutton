import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import getFromUserSettings from '/imports/ui/services/users-settings';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import ActionsBar from './component';
import Service from './service';
import VideoService from '../video-provider/service';
import { shareScreen, unshareScreen, isVideoBroadcasting } from '../screenshare/service';

const ActionsBarContainer = props => <ActionsBar {...props} />;

export default withTracker(() => {
  const togglePollMenu = () => {
    const showPoll = Session.equals('isPollOpen', false) || !Session.get('isPollOpen');

    const show = () => {
      Session.set('isUserListOpen', true);
      Session.set('isPollOpen', true);
      Session.set('forcePollOpen', true);
    };

    const hide = () => Session.set('isPollOpen', false);

    Session.set('isChatOpen', false);
    Session.set('breakoutRoomIsOpen', false);

    return showPoll ? show() : hide();
  };

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
    togglePollMenu,
  };
})(ActionsBarContainer);
