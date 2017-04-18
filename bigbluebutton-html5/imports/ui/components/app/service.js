import Breakouts from '/imports/api/breakouts';
import SettingsService from '/imports/ui/components/settings/service';

const getCaptionsStatus = () => {
  const settings = SettingsService.getSettingsFor('cc');
  return settings ? settings.closedCaptions : false;
};

const getFontSize = () => {
  const settings = SettingsService.getSettingsFor('application');
  return settings ? settings.fontSize : '16px';
};

function meetingIsBreakout() {
  const breakouts = Breakouts.find().fetch();
  return (breakouts && breakouts.some(b => b.breakoutMeetingId === Auth.meetingID));
}

export {
  getCaptionsStatus,
  getFontSize,
  meetingIsBreakout,
};
