import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import Meetings from '/imports/api/meetings';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import getFromUserSettings from '/imports/ui/services/users-settings';
import userListService from '../user-list/service';
import Service from './service';
import NavBar from './component';
import mapUser from '../../services/user/mapUser';

const PUBLIC_CONFIG = Meteor.settings.public;

const NavBarContainer = ({ children, ...props }) => (
  <NavBar {...props}>
    {children}
  </NavBar>
);


const recordProps = {
  allowStartStopRecording: false,
  autoStartRecording: false,
  record: false,
  recording: false,
};

export default withTracker(() => {
  const CLIENT_TITLE = getFromUserSettings('clientTitle', PUBLIC_CONFIG.app.clientTitle);

  let meetingTitle;
  const meetingId = Auth.meetingID;
  const meetingObject = Meetings.findOne({
    meetingId,
  });

  if (meetingObject != null) {
    meetingTitle = meetingObject.meetingProp.name;
    document.title = `${CLIENT_TITLE} - ${meetingTitle}`;
  }

  const checkUnreadMessages = () => {
    const activeChats = userListService.getActiveChats();
    const hasUnreadMessages = activeChats
      .filter(chat => chat.id !== Session.get('idChatOpen'))
      .some(chat => chat.unreadCounter > 0);
    return hasUnreadMessages;
  };

  Meetings.find({ meetingId: Auth.meetingID }, { fields: { recordProp: 1 } }).observeChanges({
    changed: (id, fields) => {
      if (fields.recordProp && fields.recordProp.recording) {
        this.window.parent.postMessage({ response: 'recordingStarted' }, '*');
      }

      if (fields.recordProp && !fields.recordProp.recording) {
        this.window.parent.postMessage({ response: 'recordingStopped' }, '*');
      }
    },
  });

  const currentUserId = Auth.userID;
  const { connectRecordingObserver, processOutsideToggleRecording } = Service;
  const currentUser = Users.findOne({ userId: Auth.userID });
  const openPanel = Session.get('openPanel');
  const isExpanded = openPanel !== '';
  const amIModerator = mapUser(currentUser).isModerator;
  const isBreakoutRoom = meetingIsBreakout();
  const hasUnreadMessages = checkUnreadMessages();

  const toggleUserList = () => {
    Session.set('isUserListOpen', !isExpanded);
  };
  const { recordProp } = meetingObject;
  // const recordProps = {
  //   allowStartStopRecording: recordProp && recordProp.allowStartStopRecording,
  //   autoStartRecording: recordProp && recordProp.autoStartRecording,
  //   record: recordProp && recordProp.record,
  //   recording: recordProp && recordProp.recording,
  // };
  recordProps.allowStartStopRecording = recordProp && recordProp.allowStartStopRecording;
  recordProps.autoStartRecording = recordProp && recordProp.autoStartRecording;
  recordProps.record = recordProp && recordProp.record;
  recordProps.recording = recordProp && recordProp.recording;
  return {
    amIModerator,
    isExpanded,
    currentUserId,
    processOutsideToggleRecording,
    connectRecordingObserver,
    meetingId,
    presentationTitle: meetingTitle,
    hasUnreadMessages,
    isBreakoutRoom,
    recordProps,
    toggleUserList,
  };
})(NavBarContainer);
