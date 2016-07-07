import { Meteor } from 'meteor/meteor';
import { callServer } from '/imports/ui/services/api';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import Chat from '/imports/api/chat';
import Meetings from '/imports/api/meetings';
import Cursor from '/imports/api/cursor';
import Polls from '/imports/api/polls';

function setCredentials(nextState, replace) {
  if (nextState && nextState.params.authToken) {
    const { meetingID, userID, authToken } = nextState.params;
    Auth.setCredentials(meetingID, userID, authToken);
    replace({
      pathname: '/'
    });
  }
};

let dataSubscriptions = null;
function subscribeForData() {
  if(dataSubscriptions) {
    return dataSubscriptions;
  }

  const subNames = ['users', 'chat', 'cursor', 'deskshare', 'meetings',
    'polls', 'presentations', 'shapes', 'slides'];

  let subs = [];
  subNames.forEach(name => subs.push(subscribeFor(name)));

  dataSubscriptions = subs;
  
  Auth.setLogOut();
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
  subscribeFor('users').then(() => {
    Promise.all(subscribeForData()).then(() => {
      if(cb) {
        cb();
      }
    })
  })
};

function onStop(error, result) {
  console.log('OnError', error, result);
};

function onReady() {
  console.log("OnReady");
};

function pollExists() {
  return !!(Polls.findOne({}));
}

export {
  pollExists,
  subscribeForData,
  setCredentials,
  subscribeFor,
  subscribeToCollections,
};
