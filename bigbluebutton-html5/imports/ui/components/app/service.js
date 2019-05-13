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

const validIOSVersion = () => {
  const SUPPORTED_OS_VERSION = 12.2;
  const iosMatch = navigator.userAgent.match(/OS (\d+)_(\d+)/);
  if (iosMatch) {
    const versionNumber = iosMatch[0].split(' ')[1].replace('_', '.');
    const isInvalid = parseFloat(versionNumber) < SUPPORTED_OS_VERSION;
    if (isInvalid) return false;
  }
  return true;
};

export {
  getCaptionsStatus,
  getFontSize,
  meetingIsBreakout,
  getBreakoutRooms,
  getMeeting,
  validIOSVersion,
};
