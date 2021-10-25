import Breakouts from '/imports/ui/local-collections/breakouts-collection/breakouts';
import Meetings from '/imports/ui/local-collections/meetings-collection/meetings';
import Settings from '/imports/ui/services/settings';
import Auth from '/imports/ui/services/auth/index';
import deviceInfo from '/imports/utils/deviceInfo';

const getFontSize = () => {
  const applicationSettings = Settings.application;
  return applicationSettings ? applicationSettings.fontSize : '16px';
};

const getBreakoutRooms = () => Breakouts.find().fetch();

function meetingIsBreakout() {
  const meeting = Meetings.findOne({ meetingId: Auth.meetingID },
    { fields: { 'meetingProp.isBreakout': 1 } });
  return (meeting && meeting.meetingProp.isBreakout);
}

const validIOSVersion = () => {
  const { isIos, isIosVersionSupported } = deviceInfo;

  if (isIos) {
    return isIosVersionSupported();
  }
  return true;
};

export {
  getFontSize,
  meetingIsBreakout,
  getBreakoutRooms,
  validIOSVersion,
};
