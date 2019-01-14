import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import { makeCall } from '/imports/ui/services/api';
import Meetings from '/imports/api/meetings';
import Breakouts from '/imports/api/breakouts';

const processOutsideToggleRecording = (e) => {
  switch (e.data) {
    case 'c_record': {
      makeCall('toggleRecording');
      break;
    }
    case 'c_recording_status': {
      const recordingState = Meetings.findOne({ meetingId: Auth.meetingID }).recordProp.recording;
      const recordingMessage = recordingState ? 'recordingStarted' : 'recordingStopped';
      this.window.parent.postMessage({ response: recordingMessage }, '*');
      break;
    }
    default: {
      // console.log(e.data);
    }
  }
};

const connectRecordingObserver = () => {
  // notify on load complete
  this.window.parent.postMessage({ response: 'readyToConnect' }, '*');
};
const getBreakouts = () => Breakouts.find({ parentMeetingId: Auth.meetingID })
  .fetch()
  .sort((a, b) => a.sequence - b.sequence);

const getUsersNotAssigned = (users) => {
  const breakouts = getBreakouts();
  const breakoutUsers = breakouts
    .reduce((acc, value) => [...acc, ...value.users], [])
    .map(u => u.userId);
  return users.filter(u => !breakoutUsers.includes(u.intId));
};
const takePresenterRole = () => makeCall('assignPresenter', Auth.userID);

export default {
  isUserPresenter: () => Users.findOne({ userId: Auth.userID }).presenter,
  isUserModerator: () => Users.findOne({ userId: Auth.userID }).moderator,
  recordSettingsList: () => Meetings.findOne({ meetingId: Auth.meetingID }).recordProp,
  meetingIsBreakout: () => Meetings.findOne({ meetingId: Auth.meetingID }).meetingProp.isBreakout,
  meetingName: () => Meetings.findOne({ meetingId: Auth.meetingID }).meetingProp.name,
  users: () => Users.find({ connectionStatus: 'online' }).fetch(),
  hasBreakoutRoom: () => Breakouts.find({ parentMeetingId: Auth.meetingID }).fetch().length > 0,
  toggleRecording: () => makeCall('toggleRecording'),
  createBreakoutRoom: (numberOfRooms, durationInMinutes, freeJoin = true, record = false) => makeCall('createBreakoutRoom', numberOfRooms, durationInMinutes, freeJoin, record),
  sendInvitation: (breakoutId, userId) => makeCall('requestJoinURL', { breakoutId, userId }),
  getBreakouts,
  getUsersNotAssigned,
  takePresenterRole,
};
