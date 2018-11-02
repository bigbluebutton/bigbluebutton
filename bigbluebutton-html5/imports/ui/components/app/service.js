import Breakouts from '/imports/api/breakouts';
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

function meetingIsBreakout() {
  const breakouts = getBreakoutRooms();
  return (breakouts && breakouts.some(b => b.breakoutId === Auth.meetingID));
}

export {
  getCaptionsStatus,
  getFontSize,
  meetingIsBreakout,
  getBreakoutRooms,
};
