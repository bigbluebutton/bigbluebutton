import Breakouts from '/imports/api/breakouts';
import Meetings from '/imports/api/meetings';
import Settings from '/imports/ui/services/settings';
import Auth from '/imports/ui/services/auth/index';

const getCaptionsStatus = () => {
  const ccSettings = Settings.cc;
  return ccSettings ? ccSettings.enabled : false;
};

const getFontSize = () => {
  const applicationSettings = Settings.application;
  return applicationSettings ? applicationSettings.fontSize : '16px';
};

const getBreakoutRooms = () => Breakouts.find().fetch();

const getMeeting = () => {
  const { meetingID } = Auth;
  return Meetings.findOne({ meetingId: meetingID });
};

function meetingIsBreakout() {
  const meeting = getMeeting();
  return (meeting && meeting.meetingProp.isBreakout);
}

export {
  getCaptionsStatus,
  getFontSize,
  meetingIsBreakout,
  getBreakoutRooms,
  getMeeting,
};
