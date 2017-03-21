import Breakouts from '/imports/api/breakouts';
import SettingsService from '/imports/ui/components/settings/service';

let currentModal = {
  component: null,
  tracker: new Tracker.Dependency,
};

const getModal = () => {
  currentModal.tracker.depend();
  return currentModal.component;
};

const showModal = (component) => {
  if (currentModal.component !== component) {
    currentModal.component = component;
    currentModal.tracker.changed();
  }
};

const clearModal = () => {
  showModal(null);
};

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
  getModal,
  showModal,
  clearModal,
  getCaptionsStatus,
  getFontSize,
  meetingIsBreakout,
};
