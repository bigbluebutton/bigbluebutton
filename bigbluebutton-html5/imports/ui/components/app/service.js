import Breakouts from '/imports/api/breakouts';
import Settings from '/imports/ui/services/settings';
import Auth from '/imports/ui/services/auth/index.js';

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

export {
  getModal,
  showModal,
  clearModal,
  getCaptionsStatus,
  getFontSize,
  meetingIsBreakout,
};
