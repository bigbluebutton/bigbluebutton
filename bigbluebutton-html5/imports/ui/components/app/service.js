import { Meteor } from 'meteor/meteor';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import Breakouts from '/imports/api/breakouts';
import Storage from '/imports/ui/services/storage/session';
import SettingsService from '/imports/ui/components/settings/service';

function setCredentials(nextState, replace) {
  if (nextState && nextState.params.authToken) {
    const { meetingID, userID, authToken } = nextState.params;
    Auth.setCredentials(meetingID, userID, authToken);
    replace({
      pathname: '/',
    });
  }
};

let dataSubscriptions = null;
function subscribeForData() {
  if (dataSubscriptions) {
    return dataSubscriptions;
  }

  const subNames = [
    'users', 'chat', 'cursor', 'deskshare', 'meetings',
    'polls', 'presentations', 'shapes', 'slides', 'captions', 'breakouts',
  ];

  let subs = [];
  subNames.forEach(name => subs.push(subscribeFor(name)));

  dataSubscriptions = subs;
  return subs;
};

function subscribeFor(collectionName) {
  const credentials = Auth.getCredentials();
  return new Promise((resolve, reject) => {
    Meteor.subscribe(collectionName, credentials, {
      onReady: (...args) => resolve(...args),
      onStop: (...args) => reject(...args),
    });
  });
};

function subscribeToCollections(cb) {
  subscribeFor('users')
    .then(() => {
      observeUserKick();
      return Promise.all(subscribeForData())
        .then(() => {
          observeBreakoutEnd();
          if (cb) {
            return cb();
          }
        });
    })
    .catch(redirectToLogoutUrl);
};

function redirectToLogoutUrl(reason) {
  console.error(reason);
  console.log('Redirecting user to the logoutURL...');
  document.location.href = Auth.logoutURL;
}

let wasKicked = false;
const wasKickedDep = new Tracker.Dependency;

function observeUserKick() {
  Users.find().observe({
    removed(old) {
      if (old.userId === Auth.userID) {
        Auth.clearCredentials(() => {
          wasKicked = true;
          wasKickedDep.changed();
        });
      }
    },
  });
}

function observeBreakoutEnd() {
  Breakouts.find().observe({
    removed(old) {
      if (old.breakoutMeetingId === Auth.meetingID) {
        // The breakout room expired. Closing the browser tab to return to the main room
        window.close();
      }
    },
  });
}

function meetingIsBreakout() {
  const breakouts = Breakouts.find().fetch();
  return (breakouts && breakouts.some(b => b.breakoutMeetingId === Auth.meetingID));
}

function wasUserKicked() {
  wasKickedDep.depend();
  return wasKicked;
}

let modal = null;
const modalDep = new Tracker.Dependency;

const getModal = () => {
  modalDep.depend();
  return modal;
};

const showModal = (val) => {
  if (val !== modal) {
    modal = val;
    modalDep.changed();
  }
};

const clearModal = () => {
  showModal(null);
};

const getCaptionsStatus = () => {
  const settings = Storage.getItem('settings_cc');
  return settings ? settings.closedCaptions : false;
};

const getFontSize = () => {
  const settings = SettingsService.getSettingsFor('application');
  return settings ? settings.fontSize : '14px';
};

export {
  subscribeForData,
  setCredentials,
  subscribeFor,
  subscribeToCollections,
  wasUserKicked,
  redirectToLogoutUrl,
  getModal,
  showModal,
  clearModal,
  getCaptionsStatus,
  getFontSize,
  meetingIsBreakout,
};
