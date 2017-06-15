import Breakouts from '/imports/api/breakouts';
import Settings from '/imports/ui/services/settings';
import Auth from '/imports/ui/services/auth/index.js';

const getCaptionsStatus = () => {
  const ccSettings = Settings.cc;
  return ccSettings ? ccSettings.enabled : false;
};

const getFontSize = () => {
  const applicationSettings = Settings.application;
  return applicationSettings ? applicationSettings.fontSize : '16px';
};

function meetingIsBreakout() {
  const breakouts = Breakouts.find().fetch();
  return (breakouts && breakouts.some(b => b.breakoutMeetingId === Auth.meetingID));
}

function getBreakoutIds() {
  console.log('getBreakoutIds', Breakouts.find().fetch().map(b => b.breakoutMeetingId));
  return Breakouts.find().fetch().map(b => b.breakoutMeetingId);
}

export {
  getCaptionsStatus,
  getFontSize,
  meetingIsBreakout,
  getBreakoutIds,
};
