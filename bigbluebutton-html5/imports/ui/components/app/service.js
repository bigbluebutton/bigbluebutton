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

function meetingIsBreakout() {
  const breakouts = Breakouts.find().fetch();
  return (breakouts && breakouts.some(b => b.breakoutId === Auth.meetingID));
}

function getBreakoutSessionTokens() {
  if (!meetingIsBreakout()) {
    const sessionTokens = Breakouts.find().fetch().map((b) => {
      const breakoutUser = b.users.find(u => u.userId === Auth.userID);

      return breakoutUser.urlParams.sessionToken;
    });
    console.log('lul3d', sessionTokens);
    return Breakouts.find().fetch().map(b => b.breakoutId);
  }
}

export {
  getCaptionsStatus,
  getFontSize,
  meetingIsBreakout,
  getBreakoutSessionTokens,
};
